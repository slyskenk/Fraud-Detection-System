import 'reflect-metadata';
import { AppDataSource } from '../config/database.config';

async function verifyDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    
    console.log('✅ Database connection successful\n');
    
    // Check tables
    console.log('📊 Checking tables...');
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`Found ${tables.length} tables:`);
    tables.forEach((table: any) => {
      console.log(`  ✓ ${table.table_name}`);
    });
    
    // Check record counts
    console.log('\n📈 Record counts:');
    
    const counts = await Promise.all([
      AppDataSource.query('SELECT COUNT(*) as count FROM users'),
      AppDataSource.query('SELECT COUNT(*) as count FROM accounts'),
      AppDataSource.query('SELECT COUNT(*) as count FROM transactions'),
      AppDataSource.query('SELECT COUNT(*) as count FROM ml_scores'),
      AppDataSource.query('SELECT COUNT(*) as count FROM fraud_alerts'),
      AppDataSource.query('SELECT COUNT(*) as count FROM travel_notices'),
      AppDataSource.query('SELECT COUNT(*) as count FROM audit_logs'),
    ]);
    
    const tableNames = [
      'users',
      'accounts',
      'transactions',
      'ml_scores',
      'fraud_alerts',
      'travel_notices',
      'audit_logs',
    ];
    
    counts.forEach((result, index) => {
      console.log(`  ${tableNames[index]}: ${result[0].count} records`);
    });
    
    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const indexes = await AppDataSource.query(`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log(`Found ${indexes.length} indexes`);
    
    // Group indexes by table
    const indexesByTable: Record<string, string[]> = {};
    indexes.forEach((idx: any) => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx.indexname);
    });
    
    Object.entries(indexesByTable).forEach(([table, idxList]) => {
      console.log(`  ${table}: ${idxList.length} indexes`);
    });
    
    // Check constraints
    console.log('\n🔒 Checking constraints...');
    const constraints = await AppDataSource.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type
      FROM pg_constraint
      WHERE connamespace = 'public'::regnamespace
    `);
    
    const constraintTypes: Record<string, number> = {
      p: 0, // Primary key
      f: 0, // Foreign key
      c: 0, // Check
      u: 0, // Unique
    };
    
    constraints.forEach((c: any) => {
      constraintTypes[c.constraint_type] = (constraintTypes[c.constraint_type] || 0) + 1;
    });
    
    console.log(`  Primary Keys: ${constraintTypes.p}`);
    console.log(`  Foreign Keys: ${constraintTypes.f}`);
    console.log(`  Check Constraints: ${constraintTypes.c}`);
    console.log(`  Unique Constraints: ${constraintTypes.u}`);
    
    // Sample data check
    console.log('\n📝 Sample data check:');
    const sampleUser = await AppDataSource.query(`
      SELECT email, first_name, last_name FROM users LIMIT 1
    `);
    
    if (sampleUser.length > 0) {
      console.log(`  ✓ Sample user: ${sampleUser[0].first_name} ${sampleUser[0].last_name} (${sampleUser[0].email})`);
    } else {
      console.log('  ⚠ No users found - run seed script');
    }
    
    const sampleTransaction = await AppDataSource.query(`
      SELECT 
        t.merchant_name,
        t.amount,
        t.currency,
        m.risk_score
      FROM transactions t
      LEFT JOIN ml_scores m ON t.id = m.transaction_id
      ORDER BY m.risk_score DESC
      LIMIT 1
    `);
    
    if (sampleTransaction.length > 0) {
      const tx = sampleTransaction[0];
      console.log(`  ✓ Highest risk transaction: ${tx.merchant_name} - ${tx.currency}${tx.amount} (Risk: ${tx.risk_score})`);
    } else {
      console.log('  ⚠ No transactions found - run seed script');
    }
    
    console.log('\n✅ Database verification complete!');
    console.log('\n📚 Next steps:');
    console.log('  1. Start the backend server: npm run dev');
    console.log('  2. Run tests: npm test');
    console.log('  3. Check API documentation');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase();
