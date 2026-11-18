# Conference App · DAS13

Application pédagogique de gestion des conférences réalisée pour les **Prosits 1 et 2** : composants, data-binding, contrôle de flux, pipes et communication entre composants avec les Signals.

## Fonctionnalités

- Page composée d’un en-tête, d’une navigation, d’un profil, d’amis, de notifications et d’un pied de page indépendants.
- Recherche immédiate sur une partie ou la totalité du titre, sans distinction de casse ou d’accents.
- Liste des conférences à venir, filtre des places disponibles et messages pour les listes vides.
- Titres en majuscules et dates françaises grâce aux pipes Angular.
- Inscription depuis une carte ou son détail : un participant ajouté par clic, sans dépassement de capacité.
- Bouton vert à partir de 10 places, orange de 1 à 9, rouge et désactivé à 0.
- Sélection et détail synchronisés par `input()` / `output()`.
- Notifications d’inscription transmises par le parent commun, compteur de lecture et profil modifiable avec `model()`.
- Interface responsive, navigation au clavier, labels, annonces accessibles et icônes SVG locales.

Les données reprennent les trois conférences de la maquette en novembre 2027, avec **25, 6 et 0 places restantes**. Les noms et adresses du tableau de bord sont des exemples de démonstration.

## Démarrer

Le projet existant utilise Angular 22. Les API employées suivent l’approche Angular 21 du cours ; aucune rétrogradation n’est nécessaire.

Prérequis Node.js compatibles : branche 22 à partir de 22.22.3, branche 24 à partir de 24.15.0, ou version 26 et ultérieure, avec npm.

```bash
npm ci
npm start
```

Ouvrir [http://localhost:4200](http://localhost:4200).

## Vérifications

```bash
npm run build
npm test -- --watch=false
```

Les tests couvrent les interactions et les règles métier : saisie réelle de recherche, sélection, couleurs aux seuils, capacité maximale, communication liste/détail/notifications et validation du profil.

## Architecture

`App` assemble la page. `Home` détient le nom du profil et les notifications. **`ConferenceList` détient les données des conférences**, les filtres et la sélection. `ConferenceDetails` reçoit la sélection et émet une demande d’inscription ; seul le parent modifie les données.

```text
App
├── Header
├── Navbar
├── Home
│   ├── ProfileUser            model : name
│   ├── FriendsList            input : friends
│   ├── NotificationList       input : notifications / output : readAll
│   └── ConferenceList         output : registrationAdded
│       └── ConferenceDetails  input : conference / output : register
└── Footer
```

Les interfaces `Conference`, `Friend` et `AppNotification` se trouvent dans `src/app/shared/models`. Les composants standalone importent explicitement leurs dépendances.

## Guide pour comprendre et présenter le travail

Le [guide du projet](docs/GUIDE_DU_PROJET.md) explique chaque mécanisme, les fichiers, les choix d’architecture et une démonstration en cinq minutes pour préparer la présentation orale.

## Portée du projet

Il s’agit d’une démonstration côté navigateur, sans backend, authentification ni réservation réelle. Les inscriptions, le profil et la lecture des notifications restent en mémoire et sont réinitialisés au rechargement. Chaque clic valide ajoute un participant, conformément au sujet.

Les dépendances, sorties de compilation, caches, fichiers `.env` et fichiers sensibles courants sont exclus par `.gitignore`. Le dossier `dist/` est généré par la compilation et n’est pas publié dans le dépôt source.
