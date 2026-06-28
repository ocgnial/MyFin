package com.myfin.myfin.config;

import com.myfin.myfin.entity.Category;
import com.myfin.myfin.repository.CategoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) return;

        Map<String, List<String>> seed = new java.util.LinkedHashMap<>();
        seed.put("Alimentation", List.of(
                "LECLERC", "CARREFOUR", "LIDL", "ALDI", "INTERMARCHE", "INTERMARCH",
                "CASINO", "MONOPRIX", "MONOP", "FRANPRIX", "PICARD", "BIOCOOP",
                "SUPER U", "SYSTEME U", "AUCHAN", "CORA", "SPAR", "NETTO"
        ));
        seed.put("Restaurants", List.of(
                "MCDONALD", "BURGER KING", "KFC", "SUBWAY", "DOMINOS", "PIZZA",
                "BRASSERIE", "RESTAURANT", "RESTO", "SUSHI", "KEBAB", "TARTINE",
                "CAFE DE", "BOULANGERIE", "PAUL ", "BRIOCHE DOREE"
        ));
        seed.put("Transport", List.of(
                "SNCF", "RATP", "TRANSDEV", "UBER", "BOLT ", "FREE NOW",
                "TOTAL ", "TOTALENERGIES", "SHELL", "BP ", "ESSO", "AVIA ",
                "ESSENCE", "AUTOROUTE", "VINCI AUTOROUTES", "SANEF", "PARKING",
                "VELIB", "LIME ", "BIRD "
        ));
        seed.put("Logement", List.of(
                "LOYER", "CHARGES", "SYNDIC", "COPROPRIETE",
                "EDF", "GDF", "ENGIE", "VEOLIA", "SUEZ ",
                "SFR", "BOUYGUES", "FREE ", "ORANGE ",
                "ASSURANCE HABITATION", "AXA ", "MAIF", "MACIF", "FREE TELECOM"
        ));
        seed.put("Sante", List.of(
                "PHARMACIE", "MEDECIN", "DENTISTE", "MUTUELLE",
                "HOPITAL", "CLINIQUE", "LABORATOIRE", "OPTICIEN",
                "SANTE", "DOCTOLIB", "CPAM", "SECU"
        ));
        seed.put("Loisirs", List.of(
                "NETFLIX", "SPOTIFY", "CANAL", "DEEZER", "APPLE MUSIC",
                "STEAM", "PLAYSTATION", "XBOX", "NINTENDO",
                "CINEMA", "FNAC", "CULTURA", "MUSEE", "THEATRE",
                "DECATHLON", "GO SPORT", "INTERSPORT"
        ));
        seed.put("Shopping", List.of(
                "AMAZON", "ZARA", "H&M", "HM ", "SHEIN", "ZALANDO",
                "CDISCOUNT", "VINTED", "LEBONCOIN", "LA REDOUTE",
                "IKEA", "MAISONS DU MONDE", "BUT ", "DARTY", "BOULANGER",
                "SEPHORA", "YVES ROCHER", "KIABI", "PRIMARK"
        ));
        seed.put("Education", List.of(
                "UDEMY", "COURSERA", "OPENCLASSROOMS", "LEETCODE",
                "PLURALSIGHT", "LINKEDIN LEARNING", "FORMATION",
                "UNIVERSITE", "ECOLE", "LIVRES", "FNAC LIVRES"
        ));
        seed.put("Voyages", List.of(
                "AIRBNB", "BOOKING", "AIR FRANCE", "RYANAIR", "EASYJET",
                "TRANSAVIA", "HOTEL", "NOVOTEL", "IBIS ", "MERCURE",
                "EXPEDIA", "VOYAGE", "TRAIN ", "TGV"
        ));

        seed.forEach((name, keywords) -> {
            Category cat = new Category();
            cat.setName(name);
            cat.setKeywords(new java.util.ArrayList<>(keywords));
            categoryRepository.save(cat);
        });
    }
}
