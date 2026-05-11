import type { MessagePart } from '#/hooks/queries/opencode/session.queries';
import { SessionMessagePart } from './SessionMessagePart';

function partsAreEqual(part1: MessagePart, part2: MessagePart) {
  if (part1.type !== part2.type) {
    return false;
  }

  if (part1.type === 'reasoning') {
    return true;
  }

  if (part1.type === 'tool' && part2.type === 'tool') {
    if (part1.tool !== part2.tool) {
      return false;
    }

    if (part1.state.status === 'error' && part2.state.status === 'error') {
      return part1.state.error === part2.state.error;
    }

    return true;
  }

  return false;
}

function dedupeConsecutiveParts(parts: MessagePart[]) {
  return parts.reduce<Array<{ count: number; part: MessagePart }>>(
    (groups, part) => {
      const previousGroup = groups.at(-1);

      if (previousGroup && partsAreEqual(previousGroup.part, part)) {
        previousGroup.count += 1;
        return groups;
      }

      groups.push({ count: 1, part });
      return groups;
    },
    [],
  );
}

export function SessionMessagePartsRenderer({
  parts,
}: {
  parts: MessagePart[];
}) {
  return dedupeConsecutiveParts(parts).map(({ count, part }) => (
    <SessionMessagePart count={count} key={part.id} part={part} />
  ));
}
