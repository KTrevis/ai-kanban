# Travaille - Kanban pour OpenCode

Travaille est une interface Kanban locale pour piloter des tâches OpenCode sur plusieurs projets Git.

Le backend stocke les projets et les cartes dans une base SQLite, expose une API HTTP/WebSocket, et communique avec OpenCode. Le frontend affiche les projets, les colonnes Kanban, les sessions OpenCode et les écrans de review Git.

## Prérequis

Installez ces outils avant de démarrer :

1. **Bun** pour lancer le monorepo.
2. **OpenCode** pour exécuter les tâches agent.
3. **Git** pour les worktrees, branches et reviews.

Commandes utiles :

- `bun install` : installe les dépendances
- `bun run dev` : démarre le frontend et le backend via Turbo.

URLs locales :

- Frontend : `http://localhost:6969`
- Backend : `http://localhost:420`
- OpenCode : `http://localhost:4096`

## Utilisation

1. Ouvrez le frontend.
2. Ajoutez un projet depuis la sidebar avec son nom et le chemin local de son dépôt Git.
3. Créez des cartes dans le Kanban du projet.
4. Lancez une tâche en mettant une carte dans la colonne AI pour créer une session OpenCode liée.
5. L'agent choisit une branche `ai/<slug>`, met à jour la carte, travaille dans un worktree dédié puis place la carte en `REVIEW`.
6. Depuis l'écran de review, consultez le diff, checkout la branche pour tester ce qui a été fait, envoyez des feedbacks à l'agent si des changements sont nécessaires, puis mergez ou reprenez la tâche.

Colonnes disponibles :

- `TODO` : tâche à faire.
- `AI` : tâche prise par l'agent.
- `REVIEW` : tâche terminée à vérifier.
- `DONE` : tâche validée.

## MCP Travaille

Le backend fournit un serveur MCP pour permettre à OpenCode de manipuler les cartes Kanban.

Commande du serveur MCP :

```bash
bun run --cwd apps/back mcp:git
```

Variable optionnelle :

```dotenv
TRAVAILLE_API_URL=http://localhost:420/
```

Outils exposés :

- `create_kanban_card`
- `get_kanban_card`
- `list_kanban_cards`
- `patch_kanban_card`

Configurez ce serveur MCP dans OpenCode si vous voulez que l'agent puisse créer, lire et mettre à jour les cartes Travaille directement.
