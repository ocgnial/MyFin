# MyFin

Application de finance personnelle en version locale, basée sur l’import de fichiers CSV bancaires.

## Objectif

Ce projet a pour but de :
- m’entraîner à construire une application web moderne ;
- importer des opérations bancaires depuis un CSV ;
- catégoriser automatiquement les dépenses ;
- calculer des statistiques utiles ;
- mémoriser les tendances de dépenses en base de données.

## Version actuelle

Version 0.1 — socle du projet.

Fonctionnalités prévues pour la première version :
- import d’un fichier CSV ;
- détection automatique des catégories ;
- statistiques de dépenses ;
- dashboard récapitulatif ;
- historique des tendances en base.

## Stack envisagée

VS-code + extensions Github + java
Perplexity pour les recherches
Installation Spring Boot via https://start.spring.io/
Dependences : 
Spring Web.
Spring Data JPA.
PostgreSQL Driver.
Validation.
Lombok, si tu veux.
Spring Boot DevTools, si disponible.
Maven

- Backend : Java + Spring Boot
- Base de données : PostgreSQL
- Frontend : React + TypeScript
- IDE : VS Code
- IA de soutien : Ollama + Gemma 4 ou Antigravity

## Démarrage

À venir.

- Avoir un fichier .env avec le mot de passe de votre BDD

DB_PASSWORD=<Votre mdp ici>

- Demarre le serveur ./mvnw spring-boot:run
./mvnw clean spring-boot:run pour clean

- Depuis le repertoire ./frontend/ 
npm run dev

- Test de reference ok : http://localhost:8080/hello

## Architecture

Voir le fichier `ARCHITECTURE.md`.

## Suivi de progression

Voir le fichier `PROGRESSION.md`.

## Statut

Projet en cours de construction.