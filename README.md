# Finlytics - Financial Analytics Dashboard

A comprehensive full-stack financial analytics dashboard built with Python Flask, MongoDB Atlas, and modern web technologies. Features a professional sidebar navigation, multiple analytics pages, and advanced data visualization.

---

## 🌐 Live Demo

**Deployed on Render:**
[https://finlytics-full-stack-finance-analysis.onrender.com](https://finlytics-full-stack-finance-analysis.onrender.com)

- Access the dashboard, analytics, and transactions live.
- API base URL for all endpoints: `https://finlytics-full-stack-finance-analysis.onrender.com/api/`

---

## 🚀 Features

### **Authentication & Security**
- JWT-based authentication system
- Secure password hashing with bcrypt
- Token verification and session management
- Protected API endpoints

### **Dashboard Overview**
- **Real-time Statistics**: Total transactions, revenue, expenses, and net profit
- **Monthly Trends Chart**: Line chart showing revenue vs expenses over time
- **Revenue vs Expenses**: Doughnut chart displaying financial breakdown
- **Transaction Status**: Pie chart showing status distribution
- **User Activity**: Bar chart displaying top users by transaction count

### **Advanced Analytics Page**
- **Category Analysis**: Bar chart showing transaction amounts by category
- **Trend Analysis**: Dual-axis line chart with transaction count and amount trends
- **Performance Metrics**: Growth rate, average transaction, and success rate
- **Top Performers**: List of users with highest transaction volumes

### **Transaction Management**
- **Comprehensive Table**: Sortable and filterable transaction data
- **Advanced Filtering**: Search by text, category, status, and user ID
- **Pagination**: Efficient data loading with configurable page sizes
- **CSV Export**: Customizable export with column selection

### **Professional UI/UX**
- **Sidebar Navigation**: Clean navigation with Finlytics branding
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern Styling**: Professional gradient backgrounds and card-based layout
- **Interactive Charts**: Chart.js powered visualizations with hover effects

## 🛠️ Technology Stack

### **Backend**
- **Python Flask**: Web framework for API development
- **MongoDB Atlas**: Cloud database for data storage
- **PyMongo**: MongoDB driver for Python
- **Flask-JWT-Extended**: JWT authentication
- **bcrypt**: Password hashing
- **pandas**: Data processing and CSV export

### **Frontend**
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Interactive functionality
- **Chart.js**: Data visualization library
- **Font Awesome**: Icon library

### **Deployment**
- **Render**: Cloud hosting platform
- **Environment Variables**: Secure configuration management

## 📁 Project Structure

```
Loopr Ai/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── render.yaml           # Render deployment configuration
├── transactions.json     # Sample transaction data
├── static/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       └── app.js        # Frontend JavaScript
└── templates/
    └── index.html        # Main HTML template
```

## 🚀 Quick Start

### **Prerequisites**
- Python 3.8+
- MongoDB Atlas account
- Git

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Loopr Ai"
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up MongoDB Atlas**
   - Create a MongoDB Atlas cluster
   - Create a database user with read/write permissions
   - Configure network access (allow all IPs for development)
   - Get your connection string

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_analytics?retryWrites=true&w=majority
   JWT_SECRET_KEY=your-secret-key-change-in-production
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   - Open http://localhost:8000
   - Login with: `admin` / `admin123`

### **Deployment on Render**

1. **Connect your repository to Render**
   - Create a new Web Service
   - Connect your GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python app.py`

2. **Configure environment variables in Render**
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET_KEY`: A secure secret key

3. **Deploy**
   - Render will automatically deploy your application
   - Access your live application at the provided URL

## 📊 API Endpoints

**Base URL:**
```
https://finlytics-full-stack-finance-analysis.onrender.com/api/
```

### **Authentication**
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/verify-token` - Verify JWT token

### **Dashboard**
- `GET /api/dashboard-stats` - Get dashboard statistics

### **Transactions**
- `GET /api/transactions` - Get transactions with filtering and pagination
- `GET /api/export-csv` - Export transactions to CSV

## 🎨 UI Components

### **Sidebar Navigation**
- **Finlytics Logo**: Professional branding with chart icon
- **Dashboard**: Overview with key metrics and charts
- **Analytics**: Advanced analytics and insights
- **Transactions**: Transaction management and export
- **Settings**: Application configuration (placeholder)
- **Logout**: Secure session termination

### **Dashboard Page**
- **Stats Cards**: Key performance indicators
- **Monthly Trends**: Revenue and expense trends over time
- **Revenue vs Expenses**: Financial breakdown visualization
- **Transaction Status**: Status distribution analysis
- **User Activity**: Top users by transaction activity

### **Analytics Page**
- **Category Analysis**: Transaction amounts by category
- **Trend Analysis**: 30-day trend with dual metrics
- **Performance Metrics**: Growth rate, average transaction, success rate
- **Top Performers**: User performance leaderboard

### **Transactions Page**
- **Advanced Filters**: Search, category, status, and user filters
- **Sortable Table**: Click column headers to sort
- **Pagination**: Navigate through large datasets
- **CSV Export**: Customizable export with column selection

## 🔧 Configuration

### **Environment Variables**
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `PORT`: Application port (default: 8000)

### **MongoDB Atlas Setup**
1. Create a new cluster
2. Create a database user
3. Configure network access (allow all IPs: 0.0.0.0/0)
4. Get connection string from cluster overview

## 📈 Sample Data

The application includes sample transaction data with:
- 1000+ transactions across multiple users
- Various categories (Revenue, Expense, etc.)
- Different statuses (completed, pending, failed)
- Realistic financial amounts and dates

## 🎯 Key Features

### **Real-time Analytics**
- Live dashboard updates
- Interactive charts with hover details
- Responsive data visualization

### **Data Management**
- Advanced filtering and search
- Sortable transaction table
- Configurable CSV export

### **Security**
- JWT-based authentication
- Secure password handling
- Protected API endpoints

### **User Experience**
- Intuitive sidebar navigation
- Professional design with gradients
- Mobile-responsive layout
- Loading states and error handling

## 🔮 Future Enhancements

- **User Management**: Add/edit/delete users
- **Real-time Notifications**: WebSocket integration
- **Advanced Reporting**: Custom report generation
- **Data Import**: Bulk transaction import
- **API Documentation**: Swagger/OpenAPI integration
- **Multi-tenant Support**: Organization-based data isolation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Create an issue in the repository

---

**Finlytics** - Empowering financial insights through advanced analytics and beautiful visualizations.

---

## 📚 Documentation

### 1. Setup Instructions

#### **Prerequisites**
- Python 3.8+
- MongoDB Atlas account
- Git

#### **Local Development**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Loopr Ai"
   ```
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up MongoDB Atlas**
   - Create a MongoDB Atlas cluster
   - Create a database user with read/write permissions
   - Configure network access (allow all IPs for development)
   - Get your connection string
4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_analytics?retryWrites=true&w=majority
   JWT_SECRET_KEY=your-secret-key-change-in-production
   ```
5. **Run the application**
   ```bash
   python app.py
   ```
6. **Access the application**
   - Open http://localhost:8000
   - Login with: `admin` / `admin123`

#### **Deployment on Render**

1. **Connect your repository to Render**
   - Create a new Web Service
   - Connect your GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python app.py`
2. **Configure environment variables in Render**
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET_KEY`: A secure secret key
3. **Deploy**
   - Render will automatically deploy your application
   - Access your live application at the provided URL

### 2. Usage Example

- **Login:** Use the credentials `admin` / `admin123` to log in.
- **Navigate:** Use the sidebar to access Dashboard, Analytics, Transactions, and Settings.
- **Filter/Sort:** Use filters and column headers in the Transactions page.
- **Export:** Click "Export CSV" to download filtered data.

---

## 📊 API Documentation

All API endpoints are prefixed with `/api/` and require a valid JWT token in the `Authorization: Bearer <token>` header (except `/api/login`).

### **Authentication**

#### `POST /api/login`
- **Description:** Authenticate user and receive JWT token.
- **Request Body:**
  ```json
  { "username": "admin", "password": "admin123" }
  ```
- **Response:**
  ```json
  { "token": "<jwt-token>", "user": { "username": "admin", "email": "...", "role": "admin" } }
  ```

#### `POST /api/logout`
- **Description:** Logout user (client-side: just remove token).
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "message": "Logged out successfully" }
  ```

#### `GET /api/verify-token`
- **Description:** Verify JWT token and get user info.
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "user": { "username": "admin", "email": "...", "role": "admin" } }
  ```

---

### **Dashboard**

#### `GET /api/dashboard-stats`
- **Description:** Get dashboard statistics (total transactions, revenue, expenses, net profit).
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "total_transactions": 300,
    "total_revenue": 339803.25,
    "total_expenses": 206605.0,
    "net_profit": 133198.25
  }
  ```

---

### **Transactions**

#### `GET /api/transactions`
- **Description:** Get transactions with filtering, sorting, and pagination.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page` (int, default: 1)
  - `limit` (int, default: 10)
  - `search` (string, optional)
  - `category` (string, optional)
  - `status` (string, optional)
  - `user_id` (string, optional)
  - `sort_by` (string, default: "date")
  - `sort_order` (int, default: -1 for desc, 1 for asc)
- **Response:**
  ```json
  {
    "transactions": [ ... ],
    "total_count": 300,
    "page": 1,
    "limit": 10,
    "total_pages": 30
  }
  ```

#### `GET /api/export-csv`
- **Description:** Export filtered transactions as CSV.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `columns` (comma-separated list, e.g. `id,date,amount`)
  - `search`, `category`, `status`, `user_id` (same as above)
- **Response:**
  - Returns a downloadable CSV file.

---

## 📝 Project Structure

```
Loopr Ai/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── render.yaml            # Render deployment configuration
├── transactions.json      # Sample transaction data
├── static/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       └── app.js        # Frontend JavaScript
└── templates/
    └── index.html        # Main HTML template
```

---

## 🔧 Configuration

- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `PORT`: Application port (default: 8000)

---

## 📈 Sample Data

- 1000+ transactions across multiple users
- Categories: Revenue, Expense, etc.
- Statuses: completed, pending, failed
- Realistic financial amounts and dates

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🧪 API Testing with Postman

A ready-to-use Postman collection is available:

- **Public Postman Collection:**  
  [Finlytics API Public Collection (Postman)](https://saumyashah-2944455.postman.co/workspace/Saumya-Shah's-Workspace~3d5e8912-f271-4dfc-8ce9-b75e04ce756c/collection/45964758-0c6a51e5-86a0-43f1-96fc-88440fa05830?action=share&creator=45964758)

### **How to Use:**
1. Open the public collection link above and click "Fork" or "Run in Postman".
2. Set the `base_url` collection variable to:
   ```
   https://finlytics-full-stack-finance-analysis.onrender.com
   ```
   (This is already set by default.)
3. Use the "Login" request first; the token will be saved automatically for other requests.
4. Test all endpoints, including filtering and CSV export. 