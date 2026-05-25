package com.myfin.myfin.repository;

import com.myfin.myfin.entity.ImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportBatchRepository extends JpaRepository<ImportBatch, Long> {
    // Permet de vérifier si le fichier a déjà été traité
    boolean existsByFilename(String filename);
}