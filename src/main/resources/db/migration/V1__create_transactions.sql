CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    merchant TEXT NOT NULL,
    amount NUMERIC(38,2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);