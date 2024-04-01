CREATE TABLE employees (
    full_name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    salary NUMERIC NOT NULL,
    bonus NUMERIC,
    penalty NUMERIC
);
