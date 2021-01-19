import { PriorityAction } from './ConcurrentAction';
import { ConcurrentScheduler } from './ConcurrentScheduler';

export const concurrent = (priority?: any) =>
  new ConcurrentScheduler(PriorityAction, { priority, scope: {}, delay: 0 });
