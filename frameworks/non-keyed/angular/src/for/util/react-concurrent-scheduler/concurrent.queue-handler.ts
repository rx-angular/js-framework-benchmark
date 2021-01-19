import { ReactSchedulerTask } from './react-scheduler/schedulerMinHeap';
import { cancelCallback, scheduleCallback } from './react-scheduler/scheduler';
import {coalescingManager} from "../default.strategies";
import {TaskQueue} from "../task-queue";

/**
 * Helper functions to schedule and unschedule tasks in a global queue.
 */
export class ConcurrentQueueHandler extends TaskQueue<ReactSchedulerTask, any> {
  _queTask = (cb: () => void, options: any): [ReactSchedulerTask, number] => {
    const id = this.getTaskId();
    const scope = options.scope;
    let task;
    if (!coalescingManager.isCoalescing(scope)) {
      coalescingManager.increment(scope);
      const priority = options.priority;
      task = scheduleCallback( priority || 3, () => {
        coalescingManager.decrement(scope);
        this.clearTask(id);
        cb();
      }, {});
      task.scope = scope;
    }

    return [task, id];
  }
  _dequeTask = (handle: any): void => {
    coalescingManager.decrement(handle.scope);
    cancelCallback(handle);
  }
};
