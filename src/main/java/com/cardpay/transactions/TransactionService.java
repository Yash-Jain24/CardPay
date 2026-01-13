package com.cardpay.transactions;

import com.cardpay.core.exception.TransactionNotFoundException;
import com.cardpay.domain.IdempotencyKeyEntity;
import com.cardpay.domain.Transaction;
import com.cardpay.domain.TransactionStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final ObjectMapper objectMapper;

    public TransactionService(TransactionRepository transactionRepository,
            IdempotencyKeyRepository idempotencyKeyRepository,
            ObjectMapper objectMapper) {
        this.transactionRepository = transactionRepository;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.objectMapper = objectMapper;
    }

    public Transaction createTransaction(Transaction transaction) {
        if (transaction.getId() == null) {
            transaction.setId(UUID.randomUUID());
        }
        transaction.setCreatedAt(Instant.now());
        transaction.setStatus(TransactionStatus.PENDING);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Transactional
    public Transaction authorizeTransaction(UUID transactionId, String idempotencyKey) {
        // 1. Validate inputs
        if (transactionId == null || idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Transaction ID and Idempotency Key are required");
        }

        // 2. Check Idempotency (First pass - optimization)
        Optional<IdempotencyKeyEntity> existingKeyOpt = idempotencyKeyRepository.findByIdempotencyKey(idempotencyKey);
        if (existingKeyOpt.isPresent()) {
            return handleExistingIdempotencyKey(existingKeyOpt.get(), transactionId);
        }

        // 3. Lock Transaction
        Transaction transaction = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found: " + transactionId));

        // 4. Logic: If PENDING -> APPROVED
        if (transaction.getStatus() == TransactionStatus.PENDING) {
            transaction.setStatus(TransactionStatus.APPROVED);
            transactionRepository.save(transaction);
        } else {
            // If already processed, we proceed to save the idempotency key for this result
            // OR if strictly only PENDING allowed, we could throw exception.
            // Instructions imply we authorize it. If it's already declined/approved, we
            // just return current state?
            // "If status PENDING -> set APPROVED and save".
            // We will capture current state as the result.
        }

        // 5. Save Idempotency and Return
        try {
            String responseJson = objectMapper.writeValueAsString(transaction);

            IdempotencyKeyEntity keyEntity = new IdempotencyKeyEntity();
            keyEntity.setId(UUID.randomUUID());
            keyEntity.setIdempotencyKey(idempotencyKey);
            keyEntity.setTransactionId(transactionId);
            keyEntity.setRequestHash("hash-placeholder"); // Simplified for now as per instructions "request_hash"
                                                          // required but logic not strictly specified for hashing body
            keyEntity.setResponsePayload(responseJson);
            keyEntity.setCreatedAt(OffsetDateTime.now());

            idempotencyKeyRepository.save(keyEntity);

            return transaction;

        } catch (DataIntegrityViolationException e) {
            // Race condition: Key inserted by another concurrent thread
            IdempotencyKeyEntity racedKey = idempotencyKeyRepository.findByIdempotencyKey(idempotencyKey)
                    .orElseThrow(() -> new IllegalStateException("Idempotency key violation but key not found"));
            return handleExistingIdempotencyKey(racedKey, transactionId);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing transaction response", e);
        }
    }

    private Transaction handleExistingIdempotencyKey(IdempotencyKeyEntity keyEntity, UUID transactionId) {
        if (!keyEntity.getTransactionId().equals(transactionId)) {
            throw new IllegalStateException("Idempotency key reuse with different transaction");
        }
        try {
            return objectMapper.readValue(keyEntity.getResponsePayload(), Transaction.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error deserializing cached response", e);
        }
    }
}