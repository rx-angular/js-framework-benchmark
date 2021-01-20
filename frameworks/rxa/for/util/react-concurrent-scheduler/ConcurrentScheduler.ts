import {PriorityAction} from './ConcurrentAction';
import {ConcurrentQueueHandler} from './concurrent.queue-handler';
import {AsapScheduler} from "rxjs/internal/scheduler/AsapScheduler";


export class ConcurrentScheduler extends AsapScheduler {
    public queueHandler = new ConcurrentQueueHandler();

    constructor(
        schedulerAction: typeof PriorityAction,
        public options: any
    ) {
        // @ts-ignore
        super(schedulerAction, options);
    }

    // @ts-ignore
    schedule<S>(
        work: (this: any, state?: S) => void,
        options?: any,
        state?: S
    ): any {
        // options get passed to action schedule. the scheduler holds the fallback priority
        return super.schedule(work as any, this.options as any, state);
    }
}
