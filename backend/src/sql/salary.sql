CREATE TABLE employees (
    full_name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    salary NUMERIC NOT NULL,
    bonus NUMERIC,
    penalty NUMERIC
);

CREATE TABLE transactions (
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    hash VARCHAR(255) UNIQUE NOT NULL
);