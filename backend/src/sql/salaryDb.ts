import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DB, POSTGRES_PORT } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_DB || !POSTGRES_PORT) {
  throw new Error(
    'Missing one or more required environment variables for PostgreSQL configuration.',
  );
}

const salaryPoolConfig = {
  user: POSTGRES_USER as string,
  password: POSTGRES_PASSWORD as string,
  host: POSTGRES_HOST as string,
  database: POSTGRES_DB as string,
  port: parseInt(POSTGRES_PORT as string, 10),
};

const salaryPool = new Pool(salaryPoolConfig);

export default salaryPool;
