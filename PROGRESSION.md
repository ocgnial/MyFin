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
- [ ] Créer l’upload CSV.
- [ ] Lire un fichier CSV.
- [ ] Afficher le nombre de lignes lues.

### Jour 5
- [ ] Enregistrer les transactions en base.
- [ ] Gérer les erreurs de format.
- [ ] Vérifier l’import complet.

### Jour 6
- [ ] Créer les premières statistiques.
- [ ] Calculer les dépenses par catégorie.
- [ ] Calculer les dépenses mensuelles.

### Jour 7
- [ ] Créer une première page dashboard (Frontend).
- [ ] Relier le frontend à l’API (Afficher les transactions).
- [ ] Faire un point sur la suite (Bilan).

## Blocages

- Aucun pour le moment.

## Décisions prises

- Projet mono-utilisateur.
- Première version uniquement basée sur CSV.
- Stack de départ : Java, Spring Boot, PostgreSQL, React.
- Développement local sans hébergement.

## Notes

- Objectif principal : apprendre en construisant.
- Objectif secondaire : produire un portfolio propre.