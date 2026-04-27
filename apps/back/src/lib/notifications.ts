import notifier from 'node-notifier';

export function notifyAgentTaskStarted(taskTitle?: string) {
  notifyAgentTask({
    title: '🔨 Travaille started',
    message: taskTitle ? taskTitle : '',
  });
}

export function notifyAgentTaskFinished(taskTitle?: string) {
  notifyAgentTask({
    title: '✅ Travaille done',
    message: taskTitle ? `${taskTitle}` : '',
  });
}

function notifyAgentTask({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  notifier.notify({ message, title }, (error) => {
    if (error) {
      console.error('Failed to display agent notification', error);
    }
  });
}
