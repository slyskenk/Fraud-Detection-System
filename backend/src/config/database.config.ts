import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'fraud_user',
  password: process.env.DATABASE_PASSWORD || 'fraud_password',
  database: process.env.DATABASE_NAME || 'fraud_detection',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false, // Always use migrations in production
  logging: process.env.NODE_ENV === 'development',
  poolSize: 20,
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

// DataSource for migrations
export const AppDataSource = new DataSource(databaseConfig as DataSourceOptions);
