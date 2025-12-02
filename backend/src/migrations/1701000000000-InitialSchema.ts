import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1701000000000 implements MigrationInterface {
  name = 'InitialSchema1701000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_users_email ON users(email)
    `);

    // Create accounts table
    await queryRunner.query(`
      CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_number VARCHAR(50) UNIQUE NOT NULL,
        account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit')),
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'NAD',
        is_frozen BOOLEAN DEFAULT false,
        frozen_at TIMESTAMP,
        frozen_reason TEXT,
        risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_accounts_user_id ON accounts(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_accounts_account_number ON accounts(account_number)
    `);

    // Create transactions table
    await queryRunner.query(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'NAD',
        merchant_name VARCHAR(255),
        merchant_category VARCHAR(100),
        merchant_risk_level INTEGER CHECK (merchant_risk_level >= 1 AND merchant_risk_level <= 5),
        location_latitude DECIMAL(10, 8),
        location_longitude DECIMAL(11, 8),
        location_country VARCHAR(100),
        location_city VARCHAR(100),
        device_fingerprint VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'blocked')),
        is_simulated BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_account_id ON transactions(account_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_transactions_status ON transactions(status)
    `);

    // Create ml_scores table
    await queryRunner.query(`
      CREATE TABLE ml_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
        model_version VARCHAR(50) NOT NULL,
        isolation_forest_score DECIMAL(5, 4),
        xgboost_score DECIMAL(5, 4),
        lstm_score DECIMAL(5, 4),
        ensemble_method VARCHAR(50),
        explanations JSONB NOT NULL,
        processing_time_ms DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ml_scores_transaction_id ON ml_scores(transaction_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ml_scores_risk_score ON ml_scores(risk_score DESC)
    `);

    // Create fraud_alerts table
    await queryRunner.query(`
      CREATE TABLE fraud_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        risk_score INTEGER NOT NULL,
        description TEXT,
        is_resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id),
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_fraud_alerts_account_id ON fraud_alerts(account_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_fraud_alerts_created_at ON fraud_alerts(created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_fraud_alerts_is_resolved ON fraud_alerts(is_resolved)
    `);

    // Create travel_notices table
    await queryRunner.query(`
      CREATE TABLE travel_notices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        destination_country VARCHAR(100) NOT NULL,
        destination_city VARCHAR(100),
        additional_countries TEXT[],
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_date_range CHECK (end_date >= start_date)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_travel_notices_account_id ON travel_notices(account_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_travel_notices_dates ON travel_notices(start_date, end_date)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_travel_notices_is_active ON travel_notices(is_active)
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
        action_type VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        ip_address INET,
        user_agent TEXT,
        request_data JSONB,
        response_data JSONB,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_logs_account_id ON audit_logs(account_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to respect foreign key constraints
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS travel_notices CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS fraud_alerts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ml_scores CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS accounts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
  }
}
