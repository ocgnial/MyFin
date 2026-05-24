# Architecture MyFin

## But

L’application MyFin permet d’importer un fichier CSV bancaire, de traiter les opérations, de les stocker en base de données, puis d’afficher un dashboard de dépenses.

## Flux global

1. L’utilisateur charge un fichier CSV.
2. Le backend reçoit le fichier.
3. Le backend valide le format du fichier.
4. Le backend extrait les lignes du CSV.
5. Les transactions sont normalisées.
6. Les transactions sont enregistrées en base.
7. Un moteur simple de catégorisation associe une catégorie à chaque transaction.
8. Le backend calcule les agrégats utiles.
9. Le frontend affiche les résultats dans un dashboard.

## Composants

### Frontend
- Interface web en React.
- Page d’import CSV.
- Page dashboard.
- Affichage des stats principales.

### Backend
- API Java Spring Boot.
- Réception des fichiers.
- Traitement des transactions.
- Catégorisation.
- Calcul des statistiques.
- Exposition des données au frontend.

### Base de données
- PostgreSQL.
- Stockage des transactions importées.
- Stockage des catégories.
- Stockage des importations.
- Stockage des tendances mensuelles.

## Tables minimales

### transactions
Contient chaque opération importée depuis le CSV.

Champs possibles :
- id
- date_operation
- libelle
- montant
- type_operation
- category_id
- import_batch_id

### categories
Contient les catégories de dépenses.

Champs possibles :
- id
- name
- color

### import_batches
Contient l’historique des imports CSV.

Champs possibles :
- id
- filename
- imported_at
- total_rows
- valid_rows
- invalid_rows

### monthly_stats
Contient les agrégations utiles au dashboard.

Champs possibles :
- id
- month
- category_id
- total_amount
- transaction_count

## Principes techniques

- Garder le système simple.
- Séparer clairement front, backend et base.
- Valider tous les fichiers importés côté serveur.
- Conserver l’historique des imports.
- Stocker les données pour pouvoir analyser les habitudes sur la durée.

## Évolution prévue

Version 1 :
- import CSV ;
- catégorisation simple par règles ;
- dashboard de dépenses ;
- stockage en base ;
- historique des tendances.

Version 2 :
- amélioration des catégories automatiques ;
- détection d’abonnements ;
- enrichissement par IA ;
- connexion bancaire si besoin plus tard.