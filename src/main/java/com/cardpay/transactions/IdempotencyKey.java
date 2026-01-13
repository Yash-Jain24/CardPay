package com.cardpay.transactions;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "idempotency_keys",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "idempotencyKey")
    }
)
public class IdempotencyKey {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, updatable = false)
    private String idempotencyKey;

    @Column(nullable = false, updatable = false)
    private UUID transactionId;

    @Column(nullable = false, columnDefinition = "TEXT", updatable = false)
    private String requestHash;

    @Column(nullable = false, columnDefinition = "TEXT", updatable = false)
    private String responsePayload;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected IdempotencyKey() {}

    public String getIdempotencyKey() { return idempotencyKey; }
    public UUID getTransactionId() { return transactionId; }
    public String getRequestHash() { return requestHash; }
    public String getResponsePayload() { return responsePayload; }

    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }
    public void setRequestHash(String requestHash) { this.requestHash = requestHash; }
    public void setResponsePayload(String responsePayload) { this.responsePayload = responsePayload; }
}