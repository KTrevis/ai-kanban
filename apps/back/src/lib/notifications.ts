import notifier from 'node-notifier';

export function notifyAgentTaskStarted(taskTitle?: string) {
  notifyAgentTask({
    message: taskTitle ? `Tache lancee : ${taskTitle}` : 'Tache lancee',
    title: 'Agent demarre',
  });
}

export function notifyAgentTaskFinished(taskTitle?: string) {
  notifyAgentTask({
    message: taskTitle ? `Tache terminee : ${taskTitle}` : 'Tache terminee',
    title: 'Agent termine',
  });
}

function notifyAgentTask({ message, title }: { message: string; title: string }) {
  notifier.notify({ message, title }, (error) => {
    if (error) {
      console.error('Failed to display agent notification', error);
    }
  });
}
