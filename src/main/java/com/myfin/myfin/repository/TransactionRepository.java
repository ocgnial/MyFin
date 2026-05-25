package com.myfin.myfin.repository; // Assure-toi que le dossier est bien /src/main/java/com/myfin/myfin/repository/

import com.myfin.myfin.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Récupère les 5 dernières transactions insérées
    List<Transaction> findTop5ByOrderByIdDesc();
}