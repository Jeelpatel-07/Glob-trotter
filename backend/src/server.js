import app from './app.js';
import config from './config/env.js';
import { testConnection } from './config/database.js';

const start = async () => {
  // Test DB connection
  const dbOk = await testConnection();
  if (dbOk) {
    console.log('✅ Database connected');
  } else {
    console.warn('⚠️  Database connection failed — server will start but DB features will not work.');
    console.warn('   Run: npm run db:migrate to create the database schema.');
  }

  app.listen(config.port, () => {
    console.log(`\n🌍 GlobeTrotter API running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health check: http://localhost:${config.port}/health\n`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
