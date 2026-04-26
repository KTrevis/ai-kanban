export function extractSessionId(lines: string[]) {
  const last = lines.at(-1);

  if (!last) {
    return null;
  }

  const split = last.split("=");

  if (split.length !== 2) {
    return null;
  }

  if (split[0].trim() !== "OPENCODE_SESSION_ID") {
    return null;
  }
  return split[1].trim();
}
