# Use official Python 3.10 image
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Expose the port (Render uses $PORT)
EXPOSE 8000

# Set environment variable for Flask to listen on all interfaces
ENV FLASK_RUN_HOST=0.0.0.0

# Start the app
CMD ["python", "app.py"] 