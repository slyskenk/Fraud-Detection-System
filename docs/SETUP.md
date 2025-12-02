# Development Setup Guide

## Overview

This guide will help you set up the Advanced Banking Fraud Prevention & Response System for local development.

## Prerequisites

### Required Software

- **Docker Desktop** (v24.0+)
- **Docker Compose** (v2.20+)
- **Node.js** (v20.0+)
- **Python** (v3.11+)
- **Git**

### Optional Tools

- **PostgreSQL Client** (for database inspection)
- **Redis CLI** (for cache inspection)
- **Postman** or **Insomnia** (for API testing)

## Quick Start with Docker

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Fraud-Detection-System
   ```

2. **Configure environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp ml/.env.example ml/.env
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

5. **View logs**:
   ```bash
   docker-compose logs -f
   ```

## Local Development Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### ML Service Setup

1. Navigate to ML directory:
   ```bash
   cd ml
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate virtual environment:
   - **Linux/Mac**: `source venv/bin/activate`
   - **Windows**: `venv\Scripts\activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start development server:
   ```bash
   uvicorn main:app --reload
   ```

## Database Setup

### Using Docker

The PostgreSQL database is automatically set up when using Docker Compose.

### Local PostgreSQL

1. Create database:
   ```sql
   CREATE DATABASE fraud_detection;
   CREATE USER fraud_user WITH PASSWORD 'fraud_password';
   GRANT ALL PRIVILEGES ON DATABASE fraud_detection TO fraud_user;
   ```

2. Run migrations (once backend is set up):
   ```bash
   cd backend
   npm run migration:run
   ```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### ML Service Tests
```bash
cd ml
pytest
```

## Troubleshooting

### Port Conflicts

If you encounter port conflicts, modify the ports in `docker-compose.yml`:
- Frontend: 5173
- Backend: 3000
- ML Service: 8000
- PostgreSQL: 5432
- Redis: 6379

### Docker Issues

1. **Clean up containers**:
   ```bash
   docker-compose down -v
   ```

2. **Rebuild images**:
   ```bash
   docker-compose build --no-cache
   ```

3. **Check logs**:
   ```bash
   docker-compose logs [service-name]
   ```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check connection settings in `.env` file

3. Test connection:
   ```bash
   psql -h localhost -U fraud_user -d fraud_detection
   ```

## Next Steps

- Review the [API Documentation](./API.md)
- Explore the [Architecture Guide](./ARCHITECTURE.md)
- Read the [Contributing Guidelines](./CONTRIBUTING.md)
