package com.myfin.myfin.repository;

import com.myfin.myfin.entity.Transaction;
import com.myfin.myfin.entity.TransactionDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Récupère les 5 dernières transactions insérées
    List<Transaction> findTop5ByOrderByIdDesc();

    // Vérifie si une transaction identique existe déjà
    boolean existsByOperationDateAndRawLabelAndAmountAndDirection(LocalDate operationDate, String rawLabel, BigDecimal amount, TransactionDirection direction);
}