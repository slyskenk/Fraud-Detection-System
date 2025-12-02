# Quick Start Guide

This guide will help you set up the database for the Advanced Banking Fraud Prevention & Response System in under 5 minutes.

## Option 1: Docker Compose (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. **Start the database services:**
   ```bash
   cd backend
   docker-compose -f docker-compose.db.yml up -d
   ```

2. **Wait for services to be healthy:**
   ```bash
   docker-compose -f docker-compose.db.yml ps
   ```
   Wait until all services show "healthy" status.

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run migrations and seed data:**
   ```bash
   npm run db:setup
   ```

5. **Verify setup:**
   ```bash
   # Check if tables were created
   docker exec -it fraud-detection-postgres psql -U fraud_user -d fraud_detection -c "\dt"
   ```

### Access Tools

- **PostgreSQL:** localhost:5432
  - Database: fraud_detection
  - User: fraud_user
  - Password: fraud_password

- **Redis:** localhost:6379

- **pgAdmin:** http://localhost:5050
  - Email: admin@fraud-detection.com
  - Password: admin

### Stop Services

```bash
docker-compose -f docker-compose.db.yml down
```

### Clean Up (Remove Data)

```bash
docker-compose -f docker-compose.db.yml down -v
```

## Option 2: Local PostgreSQL

### Prerequisites
- PostgreSQL 15+ installed locally
- Node.js 20+ installed

### Steps

1. **Create database and user:**
   ```bash
   psql -U postgres
   ```
   
   ```sql
   CREATE DATABASE fraud_detection;
   CREATE USER fraud_user WITH ENCRYPTED PASSWORD 'fraud_password';
   GRANT ALL PRIVILEGES ON DATABASE fraud_detection TO fraud_user;
   \q
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update database credentials if needed.

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run migrations and seed data:**
   ```bash
   npm run db:setup
   ```

5. **Verify setup:**
   ```bash
   psql -U fraud_user -d fraud_detection -c "\dt"
   ```

## Test Credentials

After seeding, you can use these test accounts:

### Users
| Email | Password | Accounts |
|-------|----------|----------|
| john.doe@example.com | Password123! | 2 (checking, savings) |
| jane.smith@example.com | Password123! | 1 (checking) |
| bob.wilson@example.com | Password123! | 1 (credit) |

### Sample Data Includes
- ✅ 3 users with hashed passwords
- ✅ 4 bank accounts with balances
- ✅ 8 transactions (normal, high-risk, simulated)
- ✅ ML fraud scores with SHAP explanations
- ✅ 2 fraud alerts
- ✅ 2 travel notices
- ✅ 3 audit log entries

## Verify Installation

### Check Tables
```bash
npm run migration:run
```

Expected output:
```
✅ Migrations completed successfully
```

### Check Seed Data
```bash
npm run seed
```

Expected output:
```
✅ Database seeded successfully
```

### Query Sample Data
```bash
docker exec -it fraud-detection-postgres psql -U fraud_user -d fraud_detection
```

```sql
-- Check users
SELECT email, first_name, last_name FROM users;

-- Check accounts
SELECT account_number, account_type, balance FROM accounts;

-- Check transactions with risk scores
SELECT 
  t.merchant_name, 
  t.amount, 
  t.status,
  m.risk_score
FROM transactions t
LEFT JOIN ml_scores m ON t.id = m.transaction_id
ORDER BY m.risk_score DESC;

-- Exit
\q
```

## Troubleshooting

### Port Already in Use

**Problem:** Port 5432 or 6379 already in use

**Solution:**
```bash
# Check what's using the port
lsof -i :5432
lsof -i :6379

# Stop the service or change ports in docker-compose.db.yml
```

### Connection Refused

**Problem:** Cannot connect to database

**Solution:**
1. Check if containers are running:
   ```bash
   docker-compose -f docker-compose.db.yml ps
   ```

2. Check container logs:
   ```bash
   docker-compose -f docker-compose.db.yml logs postgres
   ```

3. Restart services:
   ```bash
   docker-compose -f docker-compose.db.yml restart
   ```

### Migration Errors

**Problem:** Migration fails

**Solution:**
1. Check database connection in `.env`
2. Ensure database exists
3. Check migration logs for specific errors
4. Try reverting and re-running:
   ```bash
   npm run migration:revert
   npm run migration:run
   ```

### Seed Data Already Exists

**Problem:** Seed script reports conflicts

**Solution:**
This is normal! The seed script uses `ON CONFLICT DO NOTHING` to prevent duplicates. If you want fresh data:

```bash
# Drop and recreate database
docker exec -it fraud-detection-postgres psql -U postgres -c "DROP DATABASE fraud_detection;"
docker exec -it fraud-detection-postgres psql -U postgres -c "CREATE DATABASE fraud_detection;"
docker exec -it fraud-detection-postgres psql -U fraud_user -d fraud_detection -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Re-run setup
npm run db:setup
```

## Next Steps

After successful setup:

1. ✅ Database schema created
2. ✅ Sample data loaded
3. ✅ Ready for development

You can now:
- Start the backend API server
- Run tests
- Develop new features
- Explore the data with pgAdmin

## Additional Resources

- [DATABASE.md](./DATABASE.md) - Complete database documentation
- [.env.example](./.env.example) - Environment configuration
- [TypeORM Documentation](https://typeorm.io) - ORM reference

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs
3. Verify environment variables
4. Check PostgreSQL and Redis are running
5. Ensure all dependencies are installed

Happy coding! 🚀
