import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const {
  PG_TRANSACTIONS_USER,
  PG_TRANSACTIONS_PASSWORD,
  PG_TRANSACTIONS_HOST,
  PG_TRANSACTIONS_DATABASE,
  PG_TRANSACTIONS_PORT,
} = process.env;

const transactionsPoolConfig = {
  user: PG_TRANSACTIONS_USER,
  password: PG_TRANSACTIONS_PASSWORD,
  host: PG_TRANSACTIONS_HOST,
  database: PG_TRANSACTIONS_DATABASE,
  port: PG_TRANSACTIONS_PORT || '5432',
};

const transactionsPool = new Pool(transactionsPoolConfig);

export default transactionsPool;
