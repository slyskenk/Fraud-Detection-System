import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Hash password for test users
    const passwordHash = await argon2.hash('Password123!');

    // Seed users
    const userIds = [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003',
    ];

    await queryRunner.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, is_active)
      VALUES
        ('${userIds[0]}', 'john.doe@example.com', '${passwordHash}', 'John', 'Doe', '+264811234567', true),
        ('${userIds[1]}', 'jane.smith@example.com', '${passwordHash}', 'Jane', 'Smith', '+264811234568', true),
        ('${userIds[2]}', 'bob.wilson@example.com', '${passwordHash}', 'Bob', 'Wilson', '+264811234569', true)
      ON CONFLICT (email) DO NOTHING
    `);

    // Seed accounts
    const accountIds = [
      '660e8400-e29b-41d4-a716-446655440001',
      '660e8400-e29b-41d4-a716-446655440002',
      '660e8400-e29b-41d4-a716-446655440003',
      '660e8400-e29b-41d4-a716-446655440004',
    ];

    await queryRunner.query(`
      INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency, risk_score)
      VALUES
        ('${accountIds[0]}', '${userIds[0]}', '1234567890', 'checking', 50000.00, 'NAD', 25),
        ('${accountIds[1]}', '${userIds[0]}', '1234567891', 'savings', 150000.00, 'NAD', 15),
        ('${accountIds[2]}', '${userIds[1]}', '2234567890', 'checking', 75000.00, 'NAD', 45),
        ('${accountIds[3]}', '${userIds[2]}', '3234567890', 'credit', 25000.00, 'NAD', 60)
      ON CONFLICT (account_number) DO NOTHING
    `);

    // Seed transactions
    const transactionIds = [
      '770e8400-e29b-41d4-a716-446655440001',
      '770e8400-e29b-41d4-a716-446655440002',
      '770e8400-e29b-41d4-a716-446655440003',
      '770e8400-e29b-41d4-a716-446655440004',
      '770e8400-e29b-41d4-a716-446655440005',
      '770e8400-e29b-41d4-a716-446655440006',
      '770e8400-e29b-41d4-a716-446655440007',
      '770e8400-e29b-41d4-a716-446655440008',
    ];

    await queryRunner.query(`
      INSERT INTO transactions (
        id, account_id, transaction_type, amount, currency, merchant_name, 
        merchant_category, merchant_risk_level, location_latitude, location_longitude,
        location_country, location_city, device_fingerprint, status, is_simulated
      )
      VALUES
        -- Normal transactions for account 1
        ('${transactionIds[0]}', '${accountIds[0]}', 'debit', 250.50, 'NAD', 'Shoprite Windhoek', 
         'retail', 1, -22.5609, 17.0658, 'Namibia', 'Windhoek', 'device_fp_001', 'completed', false),
        ('${transactionIds[1]}', '${accountIds[0]}', 'debit', 1500.00, 'NAD', 'Engen Fuel Station', 
         'fuel', 2, -22.5700, 17.0800, 'Namibia', 'Windhoek', 'device_fp_001', 'completed', false),
        ('${transactionIds[2]}', '${accountIds[0]}', 'credit', 5000.00, 'NAD', 'Salary Deposit', 
         'income', 1, -22.5609, 17.0658, 'Namibia', 'Windhoek', 'device_fp_001', 'completed', false),
        
        -- High-risk transaction for account 1
        ('${transactionIds[3]}', '${accountIds[0]}', 'debit', 15000.00, 'NAD', 'Online Casino XYZ', 
         'gambling', 5, 51.5074, -0.1278, 'United Kingdom', 'London', 'device_fp_999', 'blocked', false),
        
        -- Normal transactions for account 2
        ('${transactionIds[4]}', '${accountIds[1]}', 'debit', 450.00, 'NAD', 'Pick n Pay', 
         'retail', 1, -22.5609, 17.0658, 'Namibia', 'Windhoek', 'device_fp_002', 'completed', false),
        ('${transactionIds[5]}', '${accountIds[1]}', 'debit', 3200.00, 'NAD', 'Edgars Fashion', 
         'retail', 2, -22.5700, 17.0800, 'Namibia', 'Windhoek', 'device_fp_002', 'completed', false),
        
        -- Suspicious transaction for account 3
        ('${transactionIds[6]}', '${accountIds[2]}', 'debit', 25000.00, 'NAD', 'Crypto Exchange', 
         'online', 4, 40.7128, -74.0060, 'United States', 'New York', 'device_fp_888', 'pending', false),
        
        -- Simulated transaction for testing
        ('${transactionIds[7]}', '${accountIds[3]}', 'debit', 5000.00, 'NAD', 'Test Merchant', 
         'online', 3, -22.5609, 17.0658, 'Namibia', 'Windhoek', 'device_fp_003', 'completed', true)
    `);

    // Seed ML scores
    await queryRunner.query(`
      INSERT INTO ml_scores (
        transaction_id, risk_score, model_version, isolation_forest_score, 
        xgboost_score, lstm_score, ensemble_method, explanations, processing_time_ms
      )
      VALUES
        ('${transactionIds[0]}', 15, 'v1.0.0', 0.12, 0.18, 0.15, 'weighted_average', 
         '{"features": [{"feature": "amount", "weight": 0.3, "description": "Transaction amount within normal range"}]}', 125.5),
        ('${transactionIds[1]}', 20, 'v1.0.0', 0.18, 0.22, 0.20, 'weighted_average', 
         '{"features": [{"feature": "merchant_category", "weight": 0.4, "description": "Fuel purchase is common"}]}', 130.2),
        ('${transactionIds[2]}', 5, 'v1.0.0', 0.05, 0.05, 0.05, 'weighted_average', 
         '{"features": [{"feature": "transaction_type", "weight": 0.5, "description": "Credit transaction (salary)"}]}', 115.8),
        ('${transactionIds[3]}', 87, 'v1.0.0', 0.85, 0.90, 0.86, 'weighted_average', 
         '{"features": [{"feature": "geo_distance", "weight": 0.45, "description": "Transaction from unusual location"}, {"feature": "merchant_risk", "weight": 0.35, "description": "High-risk merchant category"}]}', 185.3),
        ('${transactionIds[4]}', 12, 'v1.0.0', 0.10, 0.14, 0.12, 'weighted_average', 
         '{"features": [{"feature": "amount", "weight": 0.3, "description": "Normal grocery purchase"}]}', 120.1),
        ('${transactionIds[5]}', 25, 'v1.0.0', 0.22, 0.28, 0.25, 'weighted_average', 
         '{"features": [{"feature": "amount", "weight": 0.35, "description": "Larger than average retail purchase"}]}', 135.7),
        ('${transactionIds[6]}', 72, 'v1.0.0', 0.70, 0.75, 0.71, 'weighted_average', 
         '{"features": [{"feature": "geo_distance", "weight": 0.40, "description": "International transaction"}, {"feature": "amount", "weight": 0.35, "description": "Large amount"}]}', 175.4),
        ('${transactionIds[7]}', 35, 'v1.0.0', 0.32, 0.38, 0.35, 'weighted_average', 
         '{"features": [{"feature": "is_simulated", "weight": 0.2, "description": "Simulated transaction"}]}', 140.0)
    `);

    // Seed fraud alerts for high-risk transactions
    await queryRunner.query(`
      INSERT INTO fraud_alerts (
        transaction_id, account_id, alert_type, severity, risk_score, description
      )
      VALUES
        ('${transactionIds[3]}', '${accountIds[0]}', 'high_risk_transaction', 'critical', 87, 
         'Transaction from unusual location with high-risk merchant'),
        ('${transactionIds[6]}', '${accountIds[2]}', 'suspicious_activity', 'high', 72, 
         'Large international transaction to crypto exchange')
    `);

    // Seed travel notices
    await queryRunner.query(`
      INSERT INTO travel_notices (
        account_id, destination_country, destination_city, additional_countries, 
        start_date, end_date, is_active
      )
      VALUES
        ('${accountIds[0]}', 'South Africa', 'Cape Town', ARRAY['Botswana', 'Zimbabwe'], 
         CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '21 days', true),
        ('${accountIds[1]}', 'United Kingdom', 'London', ARRAY['France', 'Germany'], 
         CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days', false)
    `);

    // Seed audit logs
    await queryRunner.query(`
      INSERT INTO audit_logs (
        user_id, account_id, action_type, entity_type, entity_id, 
        ip_address, user_agent, status
      )
      VALUES
        ('${userIds[0]}', '${accountIds[0]}', 'login', 'user', '${userIds[0]}', 
         '192.168.1.100', 'Mozilla/5.0', 'success'),
        ('${userIds[0]}', '${accountIds[0]}', 'view_transactions', 'account', '${accountIds[0]}', 
         '192.168.1.100', 'Mozilla/5.0', 'success'),
        ('${userIds[1]}', '${accountIds[2]}', 'login', 'user', '${userIds[1]}', 
         '192.168.1.101', 'Mozilla/5.0', 'success')
    `);

    await queryRunner.commitTransaction();
    console.log('✅ Database seeded successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
