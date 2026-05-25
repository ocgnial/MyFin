package com.myfin.myfin.repository;

import com.myfin.myfin.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Les méthodes standards comme findAll(), save(), etc. sont déjà incluses.
}