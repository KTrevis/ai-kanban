function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export function getOpencodeSessionUrl({
  projectDirectory,
  sessionId,
}: {
  projectDirectory: string;
  sessionId: string;
}) {
  const encodedDirectory = encodeURIComponent(toBase64(projectDirectory));
  const encodedSessionId = encodeURIComponent(sessionId);

  return `http://127.0.0.1:4096/${encodedDirectory}/session/${encodedSessionId}`;
}
