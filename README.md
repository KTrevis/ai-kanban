# Travaille - Assistant Notion -> OpenCode

Ce projet connecte **Notion** a **OpenCode**.

Quand une tache est mise a jour dans Notion, un webhook appelle ce service. Le service envoie ensuite la tache a OpenCode pour que l'agent la traite, puis la carte Notion est remise dans la bonne colonne.

Ce guide est ecrit pour quelqu'un qui ne code pas.

## 1) Ce qu'il faut installer

Installe ces 3 outils avant de commencer:

1. **Bun** (runtime JavaScript)
2. **ngrok** (pour exposer votre serveur local a Internet)
3. **OpenCode** (l'agent qui executera les taches)

### Bun

Suivre la doc officielle: <https://bun.sh/docs/installation>

Verification:

```bash
bun --version
```

### ngrok

Suivre la doc officielle: <https://ngrok.com/docs/getting-started/>

Verification:

```bash
ngrok version
```

### OpenCode

Installez et lancez OpenCode selon votre methode habituelle (desktop, CLI, service local, etc.).

Le projet a besoin de l'URL d'OpenCode dans la variable `OPENCODE_URL` (voir section `.env`).

## 2) Recuperer le projet

Dans un terminal:

```bash
git clone <URL_DU_REPO>
cd travaille
bun install
```

## 3) Configurer les variables d'environnement

Creez un fichier `.env` a la racine du projet avec:

```dotenv
OPENCODE_URL=http://localhost:4096
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
NOTION_REDIRECT_URI=https://VOTRE-URL-NGROK/notion/oauth
```

Explication:

- `OPENCODE_URL`: adresse de votre serveur OpenCode
- `NOTION_CLIENT_ID` et `NOTION_CLIENT_SECRET`: credentials de votre integration Notion OAuth
- `NOTION_REDIRECT_URI`: URL publique ngrok + chemin `/notion/oauth`

## 4) Demarrer le service

Dans le dossier du projet:

```bash
bun run dev
```

Le serveur demarre sur le port `420`.

## 5) Ouvrir un tunnel ngrok

Dans un autre terminal:

```bash
ngrok http 420
```

ngrok vous donne une URL publique, par exemple:

`https://abcd-12-34-56-78.ngrok-free.app`

Gardez cette URL, vous en aurez besoin a deux endroits:

1. `NOTION_REDIRECT_URI` (avec `/notion/oauth`)
2. URL du webhook Notion (avec `/notion/webhook/ai`)

## 6) Configurer Notion

### A. OAuth de l'integration Notion

Dans les reglages de votre integration Notion:

- mettez la redirect URI: `https://VOTRE-URL-NGROK/notion/oauth`

Ensuite, ouvrez l'URL d'autorisation OAuth de votre app Notion, autorisez l'acces, et verifiez que le token est bien recupere par le serveur.

### B. Base de donnees Notion (obligatoire)

Votre database de taches doit contenir au minimum:

- une propriete **Projet** (type `Select`) -> nom du projet OpenCode cible
- une propriete **Session** (type `Text`) -> id de session OpenCode (peut etre vide au debut)
- une propriete **Etat** (type `Status`) avec **deux statuts obligatoires**:
  - **Human**: l'agent est bloque et a besoin d'une reponse humaine
  - **Review**: l'agent a termine la tache et attend votre verification

Important: sans les statuts **Human** et **Review**, le flux automatique ne peut pas fonctionner correctement.

### C. Webhook Notion

Configurez le webhook Notion vers:

`https://VOTRE-URL-NGROK/notion/webhook/ai`

## 7) Comment ca fonctionne au quotidien

1. Une tache Notion est envoyee au webhook.
2. Le service lit la carte (titre, description, commentaires).
3. Le service envoie la consigne a OpenCode.
4. OpenCode travaille puis remet la carte en:
   - **Review** si c'est fini
   - **Human** si une information manque

## Depannage rapide

- **Erreur de webhook**: verifier que ngrok est bien lance et que l'URL n'a pas change.
- **Erreur Notion OAuth**: verifier `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`.
- **Aucune action cote agent**: verifier que `OPENCODE_URL` est correct et que OpenCode est demarre.
