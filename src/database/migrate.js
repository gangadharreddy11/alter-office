// const { sequelize } = require('../models');

// async function migrate() {
//   try {
//     console.log('Starting database migration...');
    
//     // Test connection
//     await sequelize.authenticate();
//     console.log('✓ Database connection established');

//     // Sync all models
//     await sequelize.sync({ force: false, alter: true });
//     console.log('✓ All models synchronized');

//     console.log('Migration completed successfully!');
//     process.exit(0);
//   } catch (error) {
//     console.error('Migration failed:', error);
//     process.exit(1);
//   }
// }

// migrate();



// const { sequelize } = require('./src/models');
const { sequelize } = require('../models');
  

async function migrate() {
  try {
    console.log('Starting database migration...');

    await sequelize.authenticate();
    console.log('✓ Database connection established');

    await sequelize.sync({ force: false, alter: true });
    console.log('✓ All models synchronized');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
