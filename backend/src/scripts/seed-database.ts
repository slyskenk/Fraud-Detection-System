import 'reflect-metadata';
import { AppDataSource } from '../config/database.config';
import { seedDatabase } from '../seeds/seed-data';

async function runSeeds() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('🔄 Seeding database...');
    await seedDatabase(AppDataSource);
    
    console.log('✅ Database seeded successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

runSeeds();
