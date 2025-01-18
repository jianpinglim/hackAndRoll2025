import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

// Replace with your PostgreSQL connection string
const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  ssl: {
    require: true,
    rejectUnauthorized: false, // Set to true if using a trusted CA in production
  },
});

// Export the pool for reuse in your app
export default pool;