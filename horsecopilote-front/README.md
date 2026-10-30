# HorseCo-Pilote — Front (Angular)

Application Angular du CRM de gestion du centre équestre. Elle consomme l'API REST du dépôt [HorseCo-Pilote](https://github.com/TristanBrouille/HorseCo-Pilote) (back Spring Boot).

## Prérequis

- **Node.js** `^22.22.3`, `^24.15.0` ou `>=26` — `node -v`
- **npm 11** (fourni avec Node 24) — `npm -v`
- Le **back lancé** sur `http://localhost:8080` (voir son README : `docker compose up -d` puis `./mvnw spring-boot:run`)

## Lancer le projet

Toutes les commandes se lancent depuis ce dossier (`horsecopilote-front/`).

```bash
# 1. Installer les dépendances (Angular, AG Grid…) — à refaire après chaque pull qui modifie package.json
npm install

# 2. Lancer le serveur de développement (http://localhost:4200, rechargement automatique)
npm start
```

Ouvrir ensuite `http://localhost:4200`. L'URL de l'API est définie dans `src/app/core/api.ts` (`http://localhost:8080/api`).

## Ordre de démarrage complet (back + front)

```bash
# Dans horsecopilote/ (back)
docker compose up -d
./mvnw spring-boot:run          # Windows : .\mvnw.cmd spring-boot:run

# Dans horsecopilote-front/ (front), dans un autre terminal
npm install
npm start
```

## Tests et build

```bash
npm test          # tests unitaires (Vitest)
npm run build     # build de production dans dist/
npm run watch     # build de développement en continu
```

## Problèmes fréquents

- **Erreurs réseau / CORS dans la console** : le back n'est pas lancé, ou le front ne tourne pas sur le port 4200 (seule origine autorisée par le back).
- **Port 4200 déjà utilisé** : `npm start -- --port 4300` (il faudra alors ajouter cette origine dans `app.cors.allowed-origins` côté back).
- **Module introuvable après un pull** : relancer `npm install`.
