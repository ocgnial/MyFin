
package com.myfin.myfin.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operation_date", nullable = false)
    private LocalDate operationDate;

    @Column(name = "raw_label", nullable = false, length = 1000)
    private String rawLabel;

    @Column(name = "clean_label", length = 500)
    private String cleanLabel;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionDirection direction;

    @Column(length = 100)
    private String category;

    @Column(name = "source_file", length = 255)
    private String sourceFile;

    public Transaction() {
    }

    public Transaction(LocalDate operationDate, String rawLabel, String cleanLabel, BigDecimal amount, TransactionDirection direction, String category, String sourceFile) {
        this.operationDate = operationDate;
        this.rawLabel = rawLabel;
        this.cleanLabel = cleanLabel;
        this.amount = amount;
        this.direction = direction;
        this.category = category;
        this.sourceFile = sourceFile;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public LocalDate getOperationDate() {
        return operationDate;
    }

    public String getRawLabel() {
        return rawLabel;
    }

    public String getCleanLabel() {
        return cleanLabel;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionDirection getDirection() {
        return direction;
    }

    public String getCategory() {
        return category;
    }

    public String getSourceFile() {
        return sourceFile;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setOperationDate(LocalDate operationDate) {
        this.operationDate = operationDate;
    }

    public void setRawLabel(String rawLabel) {
        this.rawLabel = rawLabel;
    }

    public void setCleanLabel(String cleanLabel) {
        this.cleanLabel = cleanLabel;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setDirection(TransactionDirection direction) {
        this.direction = direction;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setSourceFile(String sourceFile) {
        this.sourceFile = sourceFile;
    }
}