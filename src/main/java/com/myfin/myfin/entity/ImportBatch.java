package com.myfin.myfin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "import_batches")
public class ImportBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String filename;

    private LocalDateTime importedAt;
    private Integer totalRows;
    private Integer validRows;
    private Integer invalidRows;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public LocalDateTime getImportedAt() {
        return importedAt;
    }

    public void setImportedAt(LocalDateTime importedAt) {
        this.importedAt = importedAt;
    }

    public Integer getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(Integer totalRows) {
        this.totalRows = totalRows;
    }

    public Integer getValidRows() {
        return validRows;
    }

    public void setValidRows(Integer validRows) {
        this.validRows = validRows;
    }

    public Integer getInvalidRows() {
        return invalidRows;
    }

    public void setInvalidRows(Integer invalidRows) {
        this.invalidRows = invalidRows;
    }
}