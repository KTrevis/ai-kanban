# Comment le MCP écrit sur une branche sans la checkout

Cette doc explique comment le MCP `travaille` peut créer un commit sur une branche cible sans faire de `git checkout`, sans modifier les fichiers du dossier courant, et sans toucher à l'index Git normal.

Le code principal est dans `apps/back/src/git/virtual-branch-writer.ts`.

## Résumé court

Le MCP `travaille` ne met pas des fichiers dans le staged réel d'une autre branche.

Une branche n'a pas son propre staged permanent.

Le MCP fait plutôt ceci :

```text
1. créer un index temporaire
2. y charger le snapshot de la branche cible
3. y appliquer les changements comme un git add virtuel
4. transformer cet index temporaire en tree
5. créer un commit avec commit-tree
6. faire pointer la branche cible vers ce commit avec update-ref
7. supprimer l'index temporaire
```

Phrase à retenir :

```text
travaille simule un git add dans un index temporaire basé sur la branche cible, transforme cet index en commit, puis déplace le pointeur de la branche cible vers ce commit, sans jamais checkout la branche.
```

## Le problème

Normalement, pour écrire sur une branche, on ferait :

```bash
git checkout feature/foo
modifier les fichiers
git add
git commit
```

Mais ça touche :

- la branche checkout
- les fichiers visibles dans le dossier
- le vrai index Git du repo

Le MCP veut éviter ça. Il doit pouvoir produire un commit sur une branche cible sans perturber le travail en cours.

Supposons cet état initial :

```text
HEAD -> refs/heads/main

refs/heads/main      -> A
refs/heads/ai/card-1 -> B
```

L'utilisateur est sur `main`, mais le MCP doit écrire sur `ai/card-1`.

## 1. Trouver ou créer la branche cible

Le MCP normalise le nom de branche :

```text
ai/card-1 -> refs/heads/ai/card-1
```

Une branche Git n'est pas un dossier séparé. C'est juste un pointeur nommé vers un commit :

```text
refs/heads/main        -> commit A
refs/heads/feature/foo -> commit B
```

`HEAD` indique quelle branche est actuellement checkout :

```text
HEAD -> refs/heads/main
```

Si la branche cible existe, le MCP récupère le commit vers lequel elle pointe.

Si elle n'existe pas, il la crée depuis `baseRef` avec :

```bash
git update-ref refs/heads/ai/card-1 <base-commit>
```

Cette commande modifie un pointeur de branche, mais ne change pas `HEAD`. Aucune branche n'est checkout.

## 2. Créer un index temporaire

Le MCP crée un fichier temporaire :

```text
/tmp/travaille-git-index-xyz/index
```

En gros, l'index correspond à tous les fichiers qu'on a `git add`. Quand on fait :

```bash
git add file.ts
```

Git met la version actuelle de `file.ts` dans l'index.

Quand on fait :

```bash
git commit
```

Git crée le commit à partir de l'index, pas directement à partir des fichiers du disque.

Par défaut, l'index du repo est :

```text
.git/index
```

Mais Git reconnaît une variable d'environnement spéciale : `GIT_INDEX_FILE`.

Par exemple :

```bash
GIT_INDEX_FILE=/tmp/mon-index git status
```

Dans ce cas, Git utilise `/tmp/mon-index` comme index pour cette commande, au lieu de `.git/index`.

Donc :

```bash
GIT_INDEX_FILE=/tmp/mon-index git add file.ts
```

ne modifie pas le vrai index du repo.

C'est l'astuce principale utilisée par `travaille`.

Dans le code :

```ts
const tempDir = await mkdtemp(join(tmpdir(), 'travaille-git-index-'));
const indexPath = join(tempDir, 'index');
const env = { GIT_INDEX_FILE: indexPath };
```

Toutes les commandes Git qui doivent manipuler le staged virtuel sont lancées avec cet `env`.

## 3. Charger le snapshot de la branche cible dans l'index temporaire

Le MCP charge l'état du commit parent dans l'index temporaire :

```bash
git read-tree <parentOid>
```

avec `GIT_INDEX_FILE`.

Cela veut dire :

```text
Remplis l'index temporaire avec le snapshot exact du commit parent.
```

Ça ne modifie pas les fichiers du worktree.

Après cette étape, l'index temporaire représente l'état de la branche cible avant modification.

## 4. Écrire les nouveaux contenus comme objets Git

Pour chaque fichier à écrire, le MCP stocke le contenu comme un objet Git `blob` :

```bash
git hash-object -w --stdin
```

Un `blob` est l'objet Git qui représente le contenu d'un fichier.

À ce stade, aucun fichier visible dans le dossier courant n'a changé. Git a seulement ajouté un objet dans `.git/objects`.

## 5. Modifier l'index temporaire

Ensuite, le MCP met à jour l'index temporaire :

```bash
git update-index --add --cacheinfo 100644 <blobOid> path/to/file
```

Cela veut dire :

```text
Dans l'index temporaire, path/to/file pointe maintenant vers ce nouveau blob.
```

Mentalement, c'est l'équivalent d'un `git add`, mais dans un index jetable.

Pour supprimer un fichier, il utilise :

```bash
git update-index --force-remove path/to/file
```

## 6. Transformer l'index temporaire en tree

Une fois les changements appliqués dans l'index temporaire, le MCP crée un tree :

```bash
git write-tree
```

avec `GIT_INDEX_FILE`.

Le `tree` représente le snapshot complet du projet après les modifications.

Un commit Git ne stocke pas seulement une diff textuelle. Le modèle mental utile ici est plutôt :

```text
commit -> tree -> fichiers du projet à cet instant
```

Git peut ensuite calculer une diff en comparant deux commits, mais le commit créé par le MCP pointe bien vers un snapshot complet.

## 7. Créer un commit manuellement

Le MCP crée ensuite le commit avec :

```bash
git commit-tree <treeOid> -p <parentOid> -m "message"
```

Cela crée un commit dont :

- le `tree` est le snapshot créé depuis l'index temporaire
- le parent est le commit précédent de la branche cible
- le message est celui fourni au MCP

À ce moment-là, le commit existe dans `.git/objects`, mais aucune branche ne pointe encore forcément dessus.

C'est possible dans Git : un commit peut exister sans être référencé par une branche. On appelle souvent ça un commit `dangling` ou `unreachable`.

Il peut être récupérable pendant un moment via le reflog, puis être supprimé plus tard par un garbage collection si plus rien ne le référence.

## 8. Faire pointer la branche cible vers le nouveau commit

Enfin, le MCP avance la branche cible :

```bash
git update-ref refs/heads/ai/card-1 <newCommit> <oldCommit>
```

Cette commande dit :

```text
Fais pointer refs/heads/ai/card-1 vers <newCommit>.
```

Elle ne modifie pas `HEAD`, donc elle ne change pas la branche checkout.

Le dernier argument `<oldCommit>` est une sécurité : Git ne met à jour la branche que si elle pointe encore vers ce commit attendu.

Cela évite d'écraser silencieusement un changement concurrent.

Après l'opération :

```text
HEAD -> refs/heads/main

refs/heads/main      -> A
refs/heads/ai/card-1 -> C
```

`HEAD` n'a pas bougé. Le worktree n'a pas bougé. Seule la branche cible pointe maintenant vers le nouveau commit.

## 9. Supprimer l'index temporaire

Après le commit, le MCP supprime le dossier temporaire :

```ts
await rm(tempDir, { force: true, recursive: true });
```

Il ne reste pas de staged virtuel. Il reste seulement le nouveau commit et la branche cible qui pointe dessus.

## Ce qui change et ce qui ne change pas

Ce qui change :

- `.git/objects` reçoit de nouveaux blobs, trees et commits
- `refs/heads/<branche-cible>` pointe vers un nouveau commit

Ce qui ne change pas :

- `HEAD`
- la branche checkout
- les fichiers du worktree
- le vrai index `.git/index`
- les fichiers staged de l'utilisateur

## Relation avec les outils MCP

`travaille_write_file` ne crée pas tout de suite un commit.

Il met l'écriture en attente dans un fichier JSON temporaire propre à la branche cible :

```text
/tmp/travaille-git-mcp/<hash>.json
```

Ensuite, `travaille_commit_changes` lit ces changements en attente et applique la séquence décrite ci-dessus.

`travaille_read_file` lit un fichier directement depuis une ref avec :

```bash
git show <ref>:<path>
```

`travaille_get_diff` compare la branche de base et la branche cible avec :

```bash
git diff <baseRef>...<branchRef>
```
