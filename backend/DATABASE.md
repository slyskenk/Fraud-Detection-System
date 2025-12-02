# Database Setup Guide

## Overview

This document describes the database schema, migrations, and setup process for the Advanced Banking Fraud Prevention & Response System.

## Database Schema

The system uses PostgreSQL 15+ with the following tables:

### Core Tables

#### 1. Users Table
Stores user authentication and profile information.

**Columns:**
- `id` (UUID, PK): Unique user identifier
- `email` (VARCHAR, UNIQUE): User email address
- `password_hash` (VARCHAR): Argon2 hashed password
- `first_name` (VARCHAR): User's first name
- `last_name` (VARCHAR): User's last name
- `phone_number` (VARCHAR): Contact phone number
- `created_at` (TIMESTAMP): Account creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp
- `last_login_at` (TIMESTAMP): Last login timestamp
- `is_active` (BOOLEAN): Account active status

**Indexes:**
- `idx_users_email` on `email`

#### 2. Accounts Table
Stores bank account information.

**Columns:**
- `id` (UUID, PK): Unique account identifier
- `user_id` (UUID, FK): Reference to users table
- `account_number` (VARCHAR, UNIQUE): Bank account number
- `account_type` (VARCHAR): Type (checking, savings, credit)
- `balance` (DECIMAL): Current balance in NAD
- `currency` (VARCHAR): Currency code (default: NAD)
- `is_frozen` (BOOLEAN): Freeze status
- `frozen_at` (TIMESTAMP): Freeze timestamp
- `frozen_reason` (TEXT): Reason for freeze
- `risk_score` (INTEGER): Current risk score (0-100)
- `created_at` (TIMESTAMP): Account creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Indexes:**
- `idx_accounts_user_id` on `user_id`
- `idx_accounts_account_number` on `account_number`

#### 3. Transactions Table
Stores all financial transactions.

**Columns:**
- `id` (UUID, PK): Unique transaction identifier
- `account_id` (UUID, FK): Reference to accounts table
- `transaction_type` (VARCHAR): Type (debit, credit)
- `amount` (DECIMAL): Transaction amount
- `currency` (VARCHAR): Currency code
- `merchant_name` (VARCHAR): Merchant name
- `merchant_category` (VARCHAR): Merchant category
- `merchant_risk_level` (INTEGER): Risk level (1-5)
- `location_latitude` (DECIMAL): Transaction latitude
- `location_longitude` (DECIMAL): Transaction longitude
- `location_country` (VARCHAR): Country
- `location_city` (VARCHAR): City
- `device_fingerprint` (VARCHAR): Device identifier
- `status` (VARCHAR): Status (pending, completed, failed, blocked)
- `is_simulated` (BOOLEAN): Simulation flag
- `created_at` (TIMESTAMP): Transaction timestamp
- `completed_at` (TIMESTAMP): Completion timestamp

**Indexes:**
- `idx_transactions_account_id` on `account_id`
- `idx_transactions_created_at` on `created_at DESC`
- `idx_transactions_status` on `status`

#### 4. ML Scores Table
Stores machine learning fraud detection scores.

**Columns:**
- `id` (UUID, PK): Unique score identifier
- `transaction_id` (UUID, FK): Reference to transactions table
- `risk_score` (INTEGER): Overall risk score (0-100)
- `model_version` (VARCHAR): ML model version
- `isolation_forest_score` (DECIMAL): Isolation Forest score
- `xgboost_score` (DECIMAL): XGBoost score
- `lstm_score` (DECIMAL): LSTM score
- `ensemble_method` (VARCHAR): Ensemble method used
- `explanations` (JSONB): SHAP explanations
- `processing_time_ms` (DECIMAL): Processing time
- `created_at` (TIMESTAMP): Score timestamp

**Indexes:**
- `idx_ml_scores_transaction_id` on `transaction_id`
- `idx_ml_scores_risk_score` on `risk_score DESC`

#### 5. Fraud Alerts Table
Stores fraud alerts for high-risk transactions.

**Columns:**
- `id` (UUID, PK): Unique alert identifier
- `transaction_id` (UUID, FK): Reference to transactions table
- `account_id` (UUID, FK): Reference to accounts table
- `alert_type` (VARCHAR): Alert type
- `severity` (VARCHAR): Severity (low, medium, high, critical)
- `risk_score` (INTEGER): Associated risk score
- `description` (TEXT): Alert description
- `is_resolved` (BOOLEAN): Resolution status
- `resolved_at` (TIMESTAMP): Resolution timestamp
- `resolved_by` (UUID, FK): User who resolved
- `resolution_notes` (TEXT): Resolution notes
- `created_at` (TIMESTAMP): Alert timestamp

**Indexes:**
- `idx_fraud_alerts_account_id` on `account_id`
- `idx_fraud_alerts_created_at` on `created_at DESC`
- `idx_fraud_alerts_is_resolved` on `is_resolved`

#### 6. Travel Notices Table
Stores user travel notifications.

**Columns:**
- `id` (UUID, PK): Unique notice identifier
- `account_id` (UUID, FK): Reference to accounts table
- `destination_country` (VARCHAR): Destination country
- `destination_city` (VARCHAR): Destination city
- `additional_countries` (TEXT[]): Additional countries
- `start_date` (DATE): Travel start date
- `end_date` (DATE): Travel end date
- `is_active` (BOOLEAN): Active status
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Update timestamp

**Constraints:**
- `valid_date_range`: end_date >= start_date

**Indexes:**
- `idx_travel_notices_account_id` on `account_id`
- `idx_travel_notices_dates` on `(start_date, end_date)`
- `idx_travel_notices_is_active` on `is_active`

#### 7. Audit Logs Table
Stores audit trail for all critical actions.

**Columns:**
- `id` (UUID, PK): Unique log identifier
- `user_id` (UUID, FK): Reference to users table
- `account_id` (UUID, FK): Reference to accounts table
- `action_type` (VARCHAR): Action type
- `entity_type` (VARCHAR): Entity type
- `entity_id` (UUID): Entity identifier
- `ip_address` (INET): Client IP address
- `user_agent` (TEXT): Client user agent
- `request_data` (JSONB): Request data
- `response_data` (JSONB): Response data
- `status` (VARCHAR): Action status
- `error_message` (TEXT): Error message if failed
- `created_at` (TIMESTAMP): Log timestamp

**Indexes:**
- `idx_audit_logs_user_id` on `user_id`
- `idx_audit_logs_account_id` on `account_id`
- `idx_audit_logs_created_at` on `created_at DESC`
- `idx_audit_logs_action_type` on `action_type`

## Connection Pooling

The system uses connection pooling for optimal database performance:

**Configuration:**
- Pool Size: 20 connections
- Minimum Connections: 5
- Idle Timeout: 30 seconds
- Connection Timeout: 2 seconds

## Setup Instructions

### Prerequisites

1. PostgreSQL 15+ installed and running
2. Node.js 20+ installed
3. Environment variables configured

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fraud_user
DATABASE_PASSWORD=fraud_password
DATABASE_NAME=fraud_detection
```

### Database Creation

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE fraud_detection;
CREATE USER fraud_user WITH ENCRYPTED PASSWORD 'fraud_password';
GRANT ALL PRIVILEGES ON DATABASE fraud_detection TO fraud_user;

# Exit psql
\q
```

### Running Migrations

```bash
# Install dependencies
npm install

# Run migrations
npm run migration:run
```

### Seeding Development Data

```bash
# Seed the database with test data
npm run seed
```

### Complete Setup (Migrations + Seeds)

```bash
# Run both migrations and seeds
npm run db:setup
```

## Migration Commands

### Run Migrations
```bash
npm run migration:run
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Generate New Migration
```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Create Empty Migration
```bash
npm run migration:create -- src/migrations/MigrationName
```

## Seed Data

The seed script creates:

### Users (3)
- john.doe@example.com (Password: Password123!)
- jane.smith@example.com (Password: Password123!)
- bob.wilson@example.com (Password: Password123!)

### Accounts (4)
- 2 accounts for John Doe (checking, savings)
- 1 account for Jane Smith (checking)
- 1 account for Bob Wilson (credit)

### Transactions (8)
- Normal transactions (grocery, fuel, salary)
- High-risk transactions (gambling, crypto)
- Simulated test transaction

### ML Scores
- Risk scores ranging from 5 to 87
- SHAP explanations for each transaction

### Fraud Alerts (2)
- Critical alert for gambling transaction
- High alert for crypto transaction

### Travel Notices (2)
- Active travel notice to South Africa
- Expired travel notice to UK

### Audit Logs (3)
- Login events
- Transaction view events

## Database Maintenance

### Backup

```bash
# Create backup
pg_dump -U fraud_user -d fraud_detection > backup.sql

# Restore backup
psql -U fraud_user -d fraud_detection < backup.sql
```

### Performance Monitoring

Monitor these metrics:
- Connection pool utilization
- Query execution times
- Index usage statistics
- Table sizes and growth

### Index Maintenance

```sql
-- Analyze tables for query optimization
ANALYZE users;
ANALYZE accounts;
ANALYZE transactions;
ANALYZE ml_scores;
ANALYZE fraud_alerts;
ANALYZE travel_notices;
ANALYZE audit_logs;

-- Reindex if needed
REINDEX TABLE transactions;
```

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check connection parameters in `.env`
3. Verify user permissions
4. Check firewall settings

### Migration Failures

**Problem:** Migration fails to run

**Solution:**
1. Check database connection
2. Verify migration file syntax
3. Check for conflicting schema changes
4. Review error logs
5. Revert and retry if needed

### Seed Data Issues

**Problem:** Seed script fails

**Solution:**
1. Ensure migrations have run successfully
2. Check for duplicate data (seeds use ON CONFLICT)
3. Verify foreign key relationships
4. Review error messages

## Security Considerations

1. **Password Storage:** All passwords are hashed using Argon2
2. **Connection Security:** Use SSL/TLS in production
3. **Least Privilege:** Database user has only necessary permissions
4. **Audit Logging:** All critical actions are logged
5. **Data Encryption:** Consider encrypting sensitive columns at rest

## Performance Optimization

1. **Indexes:** All frequently queried columns are indexed
2. **Connection Pooling:** Configured for optimal performance
3. **Query Optimization:** Use EXPLAIN ANALYZE for slow queries
4. **Partitioning:** Consider partitioning transactions table by date
5. **Materialized Views:** Use for complex analytics queries

## Compliance

The database schema supports:
- **ACID Transactions:** Full transactional integrity
- **Audit Trail:** Complete audit logging
- **Data Retention:** Configurable retention policies
- **GDPR Compliance:** User data can be anonymized/deleted
- **Financial Regulations:** Namibian banking standards

## References

- Requirements: 15.1, 15.5
- Design Document: Database Schema section
- TypeORM Documentation: https://typeorm.io
- PostgreSQL Documentation: https://www.postgresql.org/docs/
