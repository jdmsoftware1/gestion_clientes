import sequelize from '../config/database.js';

async function migrate() {
  try {
    console.log('🔄 Running migrations...');
    
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = sequelize.Sequelize;
    
    // 1. Add internalCode column to clients if it doesn't exist
    const clientColumns = await queryInterface.describeTable('clients');
    if (!clientColumns.internal_code) {
      console.log('📝 Adding internal_code column to clients...');
      await queryInterface.addColumn('clients', 'internal_code', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
      console.log('✅ internal_code column added to clients!');
    } else {
      console.log('ℹ️  internal_code column already exists in clients');
    }
    
    // 1b. Add salesperson_id column to clients if it doesn't exist
    if (!clientColumns.salesperson_id) {
      console.log('📝 Adding salesperson_id column to clients...');
      await queryInterface.addColumn('clients', 'salesperson_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salespeople',
          key: 'id',
        },
      });
      console.log('✅ salesperson_id column added to clients!');
    } else {
      console.log('ℹ️  salesperson_id column already exists in clients');
    }
    
    // 1c. Add created_at and updated_at columns to clients if they don't exist
    if (!clientColumns.created_at) {
      console.log('📝 Adding created_at column to clients...');
      await queryInterface.addColumn('clients', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
      console.log('✅ created_at column added to clients!');
    } else {
      console.log('ℹ️  created_at column already exists in clients');
    }
    
    if (!clientColumns.updated_at) {
      console.log('📝 Adding updated_at column to clients...');
      await queryInterface.addColumn('clients', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
      console.log('✅ updated_at column added to clients!');
    } else {
      console.log('ℹ️  updated_at column already exists in clients');
    }
    
    // 2. Add salespersonId column to sales if it doesn't exist
    try {
      const salesColumns = await queryInterface.describeTable('sales');
      if (!salesColumns.salesperson_id) {
        console.log('📝 Adding salesperson_id column to sales...');
        await queryInterface.addColumn('sales', 'salesperson_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'salespeople',
            key: 'id',
          },
        });
        console.log('✅ salesperson_id column added to sales!');
      } else {
        console.log('ℹ️  salesperson_id column already exists in sales');
      }
    } catch (error) {
      if (error.message.includes('no existe')) {
        console.log('ℹ️  Sales table does not exist yet, skipping...');
      } else {
        throw error;
      }
    }
    
    // 3. Add internalCode column to salespeople if it doesn't exist
    try {
      const salespeopleColumns = await queryInterface.describeTable('salespeople');
      if (!salespeopleColumns.internal_code) {
        console.log('📝 Adding internal_code column to salespeople...');
        await queryInterface.addColumn('salespeople', 'internal_code', {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        });
        console.log('✅ internal_code column added to salespeople!');
      } else {
        console.log('ℹ️  internal_code column already exists in salespeople');
      }
      
      // 3b. Add created_at and updated_at columns to salespeople if they don't exist
      if (!salespeopleColumns.created_at) {
        console.log('📝 Adding created_at column to salespeople...');
        await queryInterface.addColumn('salespeople', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
        console.log('✅ created_at column added to salespeople!');
      } else {
        console.log('ℹ️  created_at column already exists in salespeople');
      }
      
      if (!salespeopleColumns.updated_at) {
        console.log('📝 Adding updated_at column to salespeople...');
        await queryInterface.addColumn('salespeople', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
        console.log('✅ updated_at column added to salespeople!');
      } else {
        console.log('ℹ️  updated_at column already exists in salespeople');
      }
    } catch (error) {
      if (error.message.includes('no existe')) {
        console.log('ℹ️  Salespeople table does not exist yet, skipping...');
      } else {
        throw error;
      }
    }
    
    // 4. Add timestamps to sales table if they don't exist
    try {
      const salesColumns = await queryInterface.describeTable('sales');
      if (!salesColumns.created_at) {
        console.log('📝 Adding created_at column to sales...');
        await queryInterface.addColumn('sales', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
        console.log('✅ created_at column added to sales!');
      }
      
      if (!salesColumns.updated_at) {
        console.log('📝 Adding updated_at column to sales...');
        await queryInterface.addColumn('sales', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
        console.log('✅ updated_at column added to sales!');
      }
    } catch (error) {
      if (error.message.includes('no existe')) {
        console.log('ℹ️  Sales table does not exist yet, skipping...');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Database synchronized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();