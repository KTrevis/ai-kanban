export function groupConsecutiveAssistantMessages<
  T extends { info: { role: string } },
>(messages: T[]) {
  return messages.reduce<T[][]>((groups, message) => {
    const previousGroup = groups.at(-1);
    const shouldMergeWithPrevious =
      message.info.role !== 'user' && previousGroup?.[0]?.info.role !== 'user';

    if (shouldMergeWithPrevious && previousGroup) {
      previousGroup.push(message);
      return groups;
    }

    groups.push([message]);
    return groups;
  }, []);
}
