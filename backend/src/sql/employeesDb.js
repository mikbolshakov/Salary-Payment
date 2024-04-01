import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
const { Pool } = pkg;

const {
  PG_EMPLOYEES_USER,
  PG_EMPLOYEES_PASSWORD,
  PG_EMPLOYEES_HOST,
  PG_EMPLOYEES_DATABASE,
  PG_EMPLOYEES_PORT,
} = process.env;

const employeesPoolConfig = {
  user: PG_EMPLOYEES_USER,
  password: PG_EMPLOYEES_PASSWORD,
  host: PG_EMPLOYEES_HOST,
  database: PG_EMPLOYEES_DATABASE,
  port: PG_EMPLOYEES_PORT || '5432',
};

const employeesPool = new Pool(employeesPoolConfig);

export default employeesPool;
