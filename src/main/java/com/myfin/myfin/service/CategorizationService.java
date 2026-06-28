package com.myfin.myfin.service;

import com.myfin.myfin.entity.Category;
import com.myfin.myfin.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;

@Service
public class CategorizationService {

    private final CategoryRepository categoryRepository;

    public CategorizationService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public String categorize(String rawLabel) {
        return categorize(rawLabel, categoryRepository.findAll());
    }

    public String categorize(String rawLabel, List<Category> categories) {
        if (rawLabel == null || rawLabel.isBlank()) return "Autre";

        String normalized = normalize(rawLabel);

        for (Category category : categories) {
            for (String keyword : category.getKeywords()) {
                if (normalized.contains(normalize(keyword))) {
                    return category.getName();
                }
            }
        }

        return "Autre";
    }

    private String normalize(String input) {
        return Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toUpperCase();
    }
}
