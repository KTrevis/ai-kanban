import { getPageComments, NotionComment } from "./get-page-comments";

function buildComment(comment: NotionComment) {
  let res = `[${comment.type}] ${comment.author ?? "Auteur inconnu"}:\n`;
  res += ["```", comment.comment, "```"].join("\n");
  return res;
}

export async function buildTaskExecutionPrompt(
  title: string,
  description: string,
  cardId: string,
  sessionId: string,
) {
  const comments = await getPageComments(cardId);
  const commentsInPrompt = comments.map(buildComment);

  return [
    'Tu t\'appelles "travaille".',
    "Dans l'historique des commentaires: auteur \"travaille\" = tes anciens messages; sinon = utilisateur.",
    "",
    "Objectif: réaliser la tâche ci-dessous.",
    "",
    "Règles obligatoires:",
    "- Choisis exactement une colonne finale:",
    "  - Review: tâche effectuée; l'utilisateur va relire/valider le résultat.",
    "  - Human: tu es bloqué; tu poses une question précise à l'utilisateur pour débloquer.",
    `- Utilise uniquement ce page_id: ${cardId} (pas de search/retrieve database/data_source).`,
    "- En fin de run, fais exactement 1 patch Notion via notion_API-patch-page.",
    "- Ce patch final doit mettre à jour à la fois État (Review ou Human) et Session.",
    `- Session à écrire: ${sessionId}`,
    "- Format du patch final:",
    "```json",
    "{",
    `  \"page_id\": \"${cardId}\",`,
    '  "properties": {',
    '    "État": { "status": { "name": "Review" } },',
    '    "Session": {',
    `      "rich_text": [{ "type": "text", "text": { "content": "${sessionId}" } }]`,
    "    }",
    "  }",
    "}",
    "```",
    '- Pour Human, même format avec "name": "Human".',
    "",
    "Si Human, ajoute un commentaire Notion avec 3 points:",
    "  1) ce qui bloque",
    "  2) la question précise pour débloquer",
    "  3) la prochaine action après réponse",
    "",
    "Si Review, ajoute un court résumé de ce qui a été fait.",
    "",
    "Commentaires Notion de la carte :",
    ...(commentsInPrompt.length > 0
      ? commentsInPrompt
      : ["- Aucun commentaire sur cette carte."]),
    "",
    `Titre de la tâche : ${title}`,
    "Description de la tâche :",
    "```",
    description,
    "```",
  ].join("\n");
}
