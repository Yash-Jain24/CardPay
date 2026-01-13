CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY,
    idempotency_key TEXT NOT NULL UNIQUE,
    transaction_id UUID NOT NULL,
    request_hash TEXT NOT NULL,
    response_payload TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
