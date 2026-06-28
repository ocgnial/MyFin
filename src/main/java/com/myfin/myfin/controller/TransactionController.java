package com.myfin.myfin.controller;

import com.myfin.myfin.entity.Transaction;
import com.myfin.myfin.repository.TransactionRepository;
import com.myfin.myfin.service.CategorizationService;
import com.myfin.myfin.service.ExcelImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final ExcelImportService excelImportService;
    private final CategorizationService categorizationService;

    public TransactionController(TransactionRepository transactionRepository, ExcelImportService excelImportService, CategorizationService categorizationService) {
        this.transactionRepository = transactionRepository;
        this.excelImportService = excelImportService;
        this.categorizationService = categorizationService;
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @GetMapping("/recent")
    public List<Transaction> getRecentTransactions() {
        return transactionRepository.findTop5ByOrderByIdDesc();
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            List<Transaction> imported = excelImportService.importExcel(file);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Import Excel réussi");
            response.put("count", imported.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de l'import Excel : " + e.getMessage()));
        }
    }

    @PatchMapping("/recategorize")
    public ResponseEntity<Map<String, Object>> recategorize() {
        List<Transaction> all = transactionRepository.findAll();
        var categories = categorizationService.getAllCategories();
        all.forEach(t -> t.setCategory(categorizationService.categorize(t.getRawLabel(), categories)));
        transactionRepository.saveAll(all);
        return ResponseEntity.ok(Map.of("count", all.size()));
    }
}