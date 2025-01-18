require('dotenv').config(); //read .env file and set environment variables

const { Pool } = require('pg');

// Replace with your PostgreSQL connection string
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:h6FXUnqt2RVb@ep-super-cloud-a1d62n1d.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    require: true,
    rejectUnauthorized: false, // Set to true if using a trusted CA in production
  },
});

// Export the pool for reuse in your app
module.exports = pool;