package com.myfin.myfin.service;

import com.myfin.myfin.entity.Transaction;
import com.myfin.myfin.entity.TransactionDirection;
import com.myfin.myfin.repository.TransactionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
//import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelImportService {

    private final TransactionRepository transactionRepository;

    public ExcelImportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> importExcel(MultipartFile file) throws Exception {
        List<Transaction> transactions = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Création des styles pour colorier les lignes
            CellStyle successStyle = workbook.createCellStyle();
            successStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            successStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle duplicateStyle = workbook.createCellStyle();
            duplicateStyle.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
            duplicateStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Iterator<Row> rows = sheet.iterator();

            int dateCol = -1, labelCol = -1, debitCol = -1, creditCol = -1;
            boolean headerFound = false;

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                if (isRowEmpty(currentRow)) continue;

                // 1. Recherche de l'en-tête si pas encore trouvé
                if (!headerFound) {
                    for (Cell cell : currentRow) {
                        String val = getSafeStringValue(cell).toLowerCase();
                        if (val.contains("date")) dateCol = cell.getColumnIndex();
                        if (val.contains("libellé") || val.contains("libelle")) labelCol = cell.getColumnIndex();
                        if (val.contains("débit") || val.contains("debit")) debitCol = cell.getColumnIndex();
                        if (val.contains("crédit") || val.contains("credit")) creditCol = cell.getColumnIndex();
                    }
                    if (dateCol != -1 && labelCol != -1) {
                        headerFound = true;
                    }
                    continue; // On passe à la ligne suivante après avoir trouvé l'en-tête
                }

                // 2. Importation des données
                try {
                    // Date
                    Cell dateCell = currentRow.getCell(dateCol);
                    LocalDate opDate;
                    if (dateCell != null && DateUtil.isCellDateFormatted(dateCell)) {
                        opDate = dateCell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    } else {
                        continue; 
                    }

                    // Libellé
                    Cell labelCell = currentRow.getCell(labelCol);
                    String label = getSafeStringValue(labelCell);
                    if (label.isEmpty()) label = "SANS LIBELLE";

                    // Montant (Gestion Débit / Crédit)
                    double debit = (debitCol != -1) ? getSafeNumericValue(currentRow.getCell(debitCol)) : 0.0;
                    double credit = (creditCol != -1) ? getSafeNumericValue(currentRow.getCell(creditCol)) : 0.0;

                    BigDecimal amount;
                    TransactionDirection direction;
                    if (credit != 0) {
                        amount = BigDecimal.valueOf(Math.abs(credit));
                        direction = TransactionDirection.CREDIT;
                    } else {
                        amount = BigDecimal.valueOf(Math.abs(debit));
                        direction = TransactionDirection.DEBIT;
                    }

                    // Vérification granulaire du doublon en base de données
                    if (transactionRepository.existsByOperationDateAndRawLabelAndAmountAndDirection(opDate, label, amount, direction)) {
                        // La transaction existe déjà : on marque la ligne comme "Non importée"
                        applyStyleToRow(currentRow, duplicateStyle);
                    } else {
                        // Nouvelle transaction : on prépare l'import et on marque comme "Importée"
                        Transaction transaction = new Transaction();
                        transaction.setOperationDate(opDate);
                        transaction.setRawLabel(label);
                        transaction.setCleanLabel(label);
                        transaction.setAmount(amount);
                        transaction.setDirection(direction);
                        transaction.setSourceFile(file.getOriginalFilename());
                        
                        applyStyleToRow(currentRow, successStyle);
                        transactions.add(transaction);
                    }
                } catch (Exception e) {
                    throw new Exception("Erreur à la ligne " + (currentRow.getRowNum() + 1) + " : " + e.getMessage());
                }
            }
        }

        return transactionRepository.saveAll(transactions);
    }

    private void applyStyleToRow(Row row, CellStyle style) {
        for (Cell cell : row) {
            cell.setCellStyle(style);
        }
    }

    private String getSafeStringValue(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue().trim();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf(cell.getNumericCellValue());
        if (cell.getCellType() == CellType.BOOLEAN) return String.valueOf(cell.getBooleanCellValue());
        return "";
    }

    private double getSafeNumericValue(Cell cell) {
        if (cell == null) return 0.0;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try {
                String val = cell.getStringCellValue().replace(",", ".").trim();
                return val.isEmpty() ? 0.0 : Double.parseDouble(val);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK)
                return false;
        }
        return true;
    }
}