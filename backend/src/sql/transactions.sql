CREATE TABLE transactions (
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    hash VARCHAR(255) UNIQUE NOT NULL
);
