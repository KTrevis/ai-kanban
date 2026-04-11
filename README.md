# Travaille - Assistant Notion -> OpenCode

Ce projet connecte **Notion** à **OpenCode**.

Quand une tâche est mise à jour dans Notion, un webhook appelle ce service. Le service envoie ensuite la tâche à OpenCode pour que l'agent la traite, puis la carte Notion est remise dans la bonne colonne.

## 1) Ce qu'il faut installer

Installez ces 3 outils avant de commencer :

1. **Bun** (runtime JavaScript)
2. **ngrok** (pour exposer votre serveur local à Internet)
3. **OpenCode** (l'agent qui exécutera les tâches)

### Bun

Installation :
```bash
curl -fsSL https://bun.com/install | bash
```

Vérification :

```bash
bun --version
```

### ngrok

Suivre la doc officielle : <https://ngrok.com/docs/getting-started/>

Vérification :

```bash
ngrok version
```

### OpenCode

Installation :
```bash
curl -fsSL https://opencode.ai/install | bash
```

## 2) Récupérer le projet

Dans un terminal :

```bash
git clone <URL_DU_REPO>
cd travaille
bun install
```

## 3) Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet avec :

```dotenv
OPENCODE_URL=http://localhost:4096
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
NOTION_REDIRECT_URI=https://VOTRE-URL-NGROK/notion/oauth
```

Explication :

- `OPENCODE_URL` : adresse de votre serveur OpenCode
- `NOTION_CLIENT_ID` et `NOTION_CLIENT_SECRET` : identifiants de votre intégration Notion OAuth
- `NOTION_REDIRECT_URI` : URL publique ngrok + chemin `/notion/oauth`

Par défaut, utilisez : `OPENCODE_URL=http://localhost:4096`.

## 4) Démarrer le service

Dans le dossier du projet :

```bash
bun run dev
```

Le serveur démarre sur le port `420`.

## 5) Ouvrir un tunnel ngrok

Dans un autre terminal :

```bash
ngrok http 420
```

ngrok vous donne une URL publique, par exemple :

`https://abcd-12-34-56-78.ngrok-free.app`

Gardez cette URL, vous en aurez besoin à deux endroits :

1. `NOTION_REDIRECT_URI` (avec `/notion/oauth`)
2. URL du webhook Notion (avec `/notion/webhook/ai`)

## 6) Démarrer opencode

Dans un autre terminal :
```bash
opencode web
```

## 7) Configurer Notion

### A. OAuth de l'intégration Notion

Dans les réglages de votre intégration Notion :

- mettez la redirect URI : `https://VOTRE-URL-NGROK/notion/oauth`

Ensuite, ouvrez l'URL d'autorisation OAuth de votre app Notion, autorisez l'accès, et vérifiez que le token est bien récupéré par le serveur.

### B. Base de données Notion (obligatoire)

Votre database de tâches doit contenir au minimum :

- une propriété **Projet** (type `Select`) -> nom du projet OpenCode cible
- une propriété **Session** (type `Text`) -> id de session OpenCode (la laisser vide, le LLM se chargera de la mettre à jour)
- une propriété **État** (type `Status`) avec **deux statuts obligatoires** :
  - **Human** : l'agent est bloqué et a besoin d'une réponse humaine
  - **Review** : l'agent a terminé la tâche et attend votre vérification

Important : sans les statuts **Human** et **Review**, le flux automatique ne peut pas fonctionner correctement.

### C. Webhook Notion

Configurez le webhook Notion vers :

`https://VOTRE-URL-NGROK/notion/webhook/ai`

## Comment ça fonctionne au quotidien

1. Une tâche Notion est envoyée au webhook.
2. Le service lit la carte (titre, description, commentaires).
3. Le service envoie la consigne à OpenCode.
4. OpenCode travaille puis remet la carte en :
   - **Review** si c'est fini
   - **Human** si une information manque

## Dépannage rapide

- **Erreur de webhook** : vérifiez que ngrok est bien lancé et que l'URL n'a pas changé.
- **Erreur Notion OAuth** : vérifiez `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`.
- **Aucune action côté agent** : vérifiez que `OPENCODE_URL` est correct et que OpenCode est démarré.
