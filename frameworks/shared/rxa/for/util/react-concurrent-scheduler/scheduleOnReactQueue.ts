import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';
import { cancelCallback, scheduleCallback } from './react-scheduler/scheduler';

import { PriorityLevel } from './react-scheduler/schedulerPriorities';
import { ReactSchedulerTask } from './react-scheduler/schedulerMinHeap';

type Work = (...args: any[]) => void;

export const scheduleOnQueueOperatorFactory = <O, T>(
    scheduleTask: (work: Work, options: O) => T,
    deleteTask: (taskHandle: T) => void
) => (work: Work, options: O): Observable<T> =>
    new Observable<T>((subscriber) => {
        const task = scheduleTask(() => {
            work();
            subscriber.next(task);
        }, options);
        return () => {
            deleteTask(task);
        };
    });

function scheduleTask(
  work,
  options: {
    priority: PriorityLevel;
    scope: object;
    delay?: number;
  }
) {
  return scheduleCallback(options.priority, work, { delay: options.delay });
}

function deleteTask(taskHandle: ReactSchedulerTask): void {
  cancelCallback(taskHandle);
}

export const _scheduleOnReactQueue = scheduleOnQueueOperatorFactory(
  scheduleTask,
  deleteTask
);

export function scheduleOnReactQueue<T>(
  work: (...args: any[]) => void,
  options: {
    priority: PriorityLevel;
    scope: object;
    delay?: number;
  }
): MonoTypeOperatorFunction<T> {
  return (o$: Observable<T>): Observable<T> =>
    o$.pipe(
      switchMap((v) => _scheduleOnReactQueue(work, options).pipe(mapTo(v)))
    );
}
