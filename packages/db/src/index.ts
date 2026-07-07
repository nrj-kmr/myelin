import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/myelin";

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle(pool, { schema });

// Auto-migration table sync helper to ensure postgres works out-of-the-box
let hasEnsuredTables = false;

export async function ensureTablesExist() {
  if (hasEnsuredTables) return;
  const client = await pool.connect();
  try {
    // 1. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
        theme VARCHAR(10) DEFAULT 'dark' NOT NULL,
        email_permission BOOLEAN DEFAULT false NOT NULL,
        calendar_permission BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // 2. Create journal_entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE NOT NULL,
        date_key VARCHAR(20) NOT NULL,
        journal TEXT DEFAULT '' NOT NULL,
        mood VARCHAR(50) DEFAULT 'neutral' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT unique_user_date UNIQUE (user_email, date_key)
      );
    `);

    // 3. Create expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE NOT NULL,
        date_key VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // 4. Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE NOT NULL,
        date_key VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        time VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    console.log("PostgreSQL schema validated: All tables verified successfully.");
    hasEnsuredTables = true;
  } catch (error) {
    console.error("Failed to run PostgreSQL schema setup:", error);
  } finally {
    client.release();
  }
}
export * from "./schema";
