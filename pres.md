# Introduction

Aujourd'hui, quand on utilise des agents de code, on passe très souvent par une interface de tchat.
On ouvre Claude Code, OpenCode, Cursor, Codex ou autre, on explique ce qu'on veut faire, on colle du contexte,
et l'agent travaille à partir de ça.

C'est une interface très pratique parce qu'elle est polyvalente : on peut lui demander à peu près n'importe quoi,
itérer facilement, poser des questions, corriger la direction en cours de route.
Mais ce n'est pas forcément la seule façon intéressante d'interagir avec un agent.

Dans beaucoup de cas, le contexte dont l'agent a besoin existe déjà quelque part : dans une carte Notion,
une issue GitHub, un board Trello, ou même dans un outil interne.
Et malgré ça, notre workflow consiste souvent à copier-coller ce contexte dans le tchat,
puis à demander à l'agent de faire le travail.

Ce qui est intéressant, c'est que la plupart des harness mettent aussi à disposition un SDK.
Ce SDK permet de faire via du code une partie des actions qu'on a l'habitude de faire manuellement dans l'interface :
créer une session, envoyer du contexte à l'agent, suivre son avancement, récupérer ses messages,
ou brancher tout ça à d'autres outils.

Concrètement, ça veut dire qu'on peut construire nos propres interfaces ou nos propres workflows par dessus le harness.
Au lieu de toujours ramener le contexte vers le tchat, on peut déclencher un agent directement depuis l'endroit où le contexte existe déjà.

Le but de cette présentation, c'est de vous montrer un exemple concret de ce que ça permet de faire.

# Sortir l'agent du tchat

En partant de cette idée, je me suis demandé ce que ça donnerait si on pouvait directement distribuer des cartes Trello à des agents.
Chaque carte contient déjà un une bonne partie du contexte nécessaire pour lancer une tâche.

J'ai donc développé un petit outil pour expérimenter cette idée, et c'est ce que je vais vous montrer en démo.

Le but c'est pas de vous dire "mon outil est super utilisez-le", mais de vous montrer à quel point vous pouvez personnaliser votre workflow,
et peut-être de vous donner des idées.

# Démo

Donc je vais partir d'un board avec plusieurs cartes, chaque carte représente une tâche qui sera confiée à un agent.

Chaque carte possède un titre, une description, et une branche sur laquelle l'agent va se baser pour réaliser sa tâche.

Le concept est simple, quand je passe une carte dans la colonne IA, ça crée une session dans Opencode (montrer la session),
en donnant à l'agent toutes les informations sur la carte.

Chaque agent agent va réaliser sa tâche dans un worktree et dans une branche dédiée,
ce qui permet d'avoir plusieurs agents qui travaillent sur différentes tâches en parallèle.

Quand un agent a fini une tâche, il met la carte sur laquelle il travaillait dans la colonne "REVIEW",
et ici on peut directement lui faire des feedbacks sur le code qu'il a généré (montrer un exemple en live), et checkout la branche si on veut tester ses changements.

# Quand c'est pertinent

Cette façon de travailler est cool, mais elle est pas toujours pertinente.

De ce que j'ai pu expérimenter elle s'est surtout montrée pertinente quand on a beaucoup de petites tâches indépendantes à régler,
quand on a des retours clients ou bien qu'on a besoin de faire des ajustements d'UI.

Quand il s'agit de créer des grosses features, c'est pas toujours très pertinent.
La force de l'outil est de pouvoir facilement suivre des tâches réalisées en parallèle.
Si on a surtout besoin d'itérer beaucoup avec l'agent, pour moi ce sera toujours mieux de passer par un tchat classique.

# Conclusion

Du coup la conclusion c'est que les SDK nous permettent de construire des workflows de génération de code adaptés des cas précis,
on est pas obligés de passer uniquement via un tchat.

Je pense que le tchat reste l'interface la plus polyvalente, mais dès qu'un contexte est déjà structuré quelque part,
par exemple sur un Kanban notion, on peut déclencher un agent directement depuis ce contexte.
