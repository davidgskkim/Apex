require('dotenv').config()
const postgres = require('postgres')
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL is not set in your .env file!');
  process.exit(1); // Stop the app if the URL is missing
}
const sql = postgres(connectionString, {
  ssl: 'require',
});
async function testConnection() {
  try {
    const result = await sql`SELECT 1`;
    console.log('Database connected successfully!');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

testConnection(); 
module.exports = sql;