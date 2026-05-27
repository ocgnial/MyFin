# Progression MyFin

## Règle de suivi

Je note ici ce qui a été fait, ce qui bloque, et ce que je fais ensuite.

## Semaine 1

### Jour 1
- [x] Créer le dépôt local.
- [x] Ajouter README.md.
- [x] Ajouter ARCHITECTURE.md.
- [x] Ajouter PROGRESSION.md.
- [x] Définir le périmètre de la version 0.1.

Mise en place de l'environnement de dev

 
### Jour 2
- [ X] Créer le projet Spring Boot.

./mvnw spring-boot:run pour build

- [X ] Vérifier le démarrage local.
- [X ] Créer un endpoint de santé.
http://localhost:8080/hello - ok

### Jour 3
- [X] Installer PostgreSQL local.
- [X] Créer la base MyFin.
- [X] Créer les premières tables (Entité Transaction + Repository).
- [X] Créer le TransactionController pour lister les transactions.
- [X] Vérifier le fonctionnement de l'API /api/transactions (retourne un tableau vide).

### Jour 4
- [X] Créer l’upload Excel (Endpoint POST /import).
- [X] Lire un fichier .xlsx (Service Apache POI).
- [X] Retourner le nombre de transactions importées.

### Jour 5
- [X] Enregistrer les transactions en base (Repository.saveAll).
- [X] Gérer les erreurs de format (Flexibilité CellType).
- [X] Vérifier l’import complet.

### Jour 6
- [ ] Créer les premières statistiques.
- [ ] Calculer les dépenses par catégorie.
- [ ] Calculer les dépenses mensuelles.

### Jour 7
- [X] Créer une première page dashboard (Frontend).
- [X] Relier le frontend à l’API (Afficher les transactions).
- [ ] Faire un point sur la suite (Bilan).

### Jour 8
- [X] Analyser l'UX du dashboard existant.
- [X] Identifier les éléments fictifs ou génériques à supprimer du front.
- [X] Refaire le dashboard en une page plus claire et orientée finances personnelles.
- [X] Ajouter les cartes de synthèse : solde estimé, revenus, dépenses, nombre de transactions.
- [X] Améliorer le graphique de flux de trésorerie.
- [X] Ajouter l'analyse des dépenses par catégorie à partir des transactions importées.
- [X] Ajouter une recherche et des filtres locaux sur les opérations.
- [X] Refaire le composant d'import Excel avec une zone drag & drop, message de succès et erreurs lisibles.
- [X] Corriger le problème de rendu CSS : Tailwind n'était pas compilé/installé, remplacement par un CSS classique autonome.
- [X] Vérifier le frontend avec `npm run build`.
- [X] Vérifier le frontend avec `npm run lint`.

## Blocages

- PowerShell peut bloquer `npm run dev` avec une erreur `npm.ps1` si l'exécution de scripts est désactivée.
- Solution rapide : lancer le frontend avec `npm.cmd run dev` depuis `frontend/`.
- Alternative durable : autoriser les scripts utilisateur avec `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

## Décisions prises

- Projet mono-utilisateur.
- Première version uniquement basée sur Excel (.xlsx).
- Stack de départ : Java, Spring Boot, PostgreSQL, React.
- Développement local sans hébergement.
- Le front ne dépend plus de Tailwind pour son rendu principal afin d'éviter un affichage brut si Tailwind n'est pas installé ou compilé.

## Notes

- Objectif principal : apprendre en construisant.
- Objectif secondaire : produire un portfolio propre.
- Le dashboard reste volontairement centré sur les données réellement disponibles dans l'API actuelle.
- Les statistiques plus avancées pourront ensuite être déplacées côté backend quand les endpoints dédiés seront créés.
