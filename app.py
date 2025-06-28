from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
import json
import pandas as pd
import bcrypt
import os
from datetime import datetime, timedelta
import io
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

jwt = JWTManager(app)
CORS(app)

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
if 'mongodb+srv://' in MONGO_URI:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000, retryWrites=True, w='majority', tlsAllowInvalidCertificates=True)
else:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

db = client['financial_analytics']
transactions_collection = db['transactions']
users_collection = db['users']

def init_sample_data():
    try:
        if transactions_collection.count_documents({}) == 0:
            with open('transactions.json', 'r') as f:
                transactions = json.load(f)
            for transaction in transactions:
                transaction['date'] = datetime.fromisoformat(transaction['date'].replace('Z', '+00:00'))
            transactions_collection.insert_many(transactions)
    except Exception:
        pass

def init_sample_user():
    try:
        if users_collection.count_documents({}) == 0:
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
            user = {
                'username': 'admin',
                'password': hashed_password,
                'email': 'admin@financial.com',
                'role': 'admin'
            }
            users_collection.insert_one(user)
    except Exception:
        pass

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = users_collection.find_one({'username': username})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        access_token = create_access_token(identity=username)
        return jsonify({
            'token': access_token,
            'user': {
                'username': user['username'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    current_user = get_jwt_identity()
    user = users_collection.find_one({'username': current_user})
    if user:
        return jsonify({
            'user': {
                'username': user['username'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        total_transactions = transactions_collection.count_documents({})
        revenue_pipeline = [
            {'$match': {'category': 'Revenue'}},
            {'$group': {'_id': None, 'total': {'$sum': '$amount'}}}
        ]
        expense_pipeline = [
            {'$match': {'category': 'Expense'}},
            {'$group': {'_id': None, 'total': {'$sum': '$amount'}}}
        ]
        revenue_result = list(transactions_collection.aggregate(revenue_pipeline))
        expense_result = list(transactions_collection.aggregate(expense_pipeline))
        total_revenue = revenue_result[0]['total'] if revenue_result else 0
        total_expenses = expense_result[0]['total'] if expense_result else 0
        net_profit = total_revenue - total_expenses
        return jsonify({
            'total_transactions': total_transactions,
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'net_profit': net_profit
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        status = request.args.get('status', '')
        user_id = request.args.get('user_id', '')
        sort_by = request.args.get('sort_by', 'date')
        sort_order = int(request.args.get('sort_order', -1))
        filter_query = {}
        if search:
            filter_query['$or'] = [
                {'user_id': {'$regex': search, '$options': 'i'}},
                {'category': {'$regex': search, '$options': 'i'}},
                {'status': {'$regex': search, '$options': 'i'}}
            ]
        if category:
            filter_query['category'] = category
        if status:
            filter_query['status'] = status
        if user_id:
            filter_query['user_id'] = user_id
        total_count = transactions_collection.count_documents(filter_query)
        skip = (page - 1) * limit
        transactions = list(transactions_collection.find(
            filter_query,
            {'_id': 0}
        ).sort(sort_by, sort_order).skip(skip).limit(limit))
        for transaction in transactions:
            if isinstance(transaction['date'], datetime):
                transaction['date'] = transaction['date'].isoformat()
        return jsonify({
            'transactions': transactions,
            'total_count': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export-csv', methods=['GET'])
@jwt_required()
def export_csv():
    try:
        columns = request.args.get('columns', '').split(',')
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        status = request.args.get('status', '')
        user_id = request.args.get('user_id', '')
        filter_query = {}
        if search:
            filter_query['$or'] = [
                {'user_id': {'$regex': search, '$options': 'i'}},
                {'category': {'$regex': search, '$options': 'i'}},
                {'status': {'$regex': search, '$options': 'i'}}
            ]
        if category:
            filter_query['category'] = category
        if status:
            filter_query['status'] = status
        if user_id:
            filter_query['user_id'] = user_id
        transactions = list(transactions_collection.find(filter_query, {'_id': 0}))
        if not transactions:
            return jsonify({'error': 'No data to export'}), 400
        df = pd.DataFrame(transactions)
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d %H:%M:%S')
        if columns and columns[0]:
            available_columns = [col for col in columns if col in df.columns]
            if available_columns:
                df = df[available_columns]
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
        csv_file = io.BytesIO(csv_buffer.getvalue().encode('utf-8'))
        csv_file.seek(0)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'financial_transactions_{timestamp}.csv'
        return send_file(
            csv_file,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    init_sample_data()
    init_sample_user()
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))