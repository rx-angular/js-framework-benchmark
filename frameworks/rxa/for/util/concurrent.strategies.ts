import {
    scheduleOnReactQueue
} from './react-concurrent-scheduler';
import {
    IdlePriority,
    ImmediatePriority, LowPriority,
    NoPriority, NormalPriority,
    UserBlockingPriority
} from "./react-concurrent-scheduler/react-scheduler/schedulerPriorities";

export function getConcurrentSchedulerStrategyCredentialsMap(): any {
    return {
        noPriority: createNoPriorityStrategyCredentials(),
        immediate: createImmediateStrategyCredentials(),
        userBlocking: createUserBlockingStrategyCredentials(),
        normal: createNormalStrategyCredentials(),
        low: createLowStrategyCredentials(),
        idle: createIdleStrategyCredentials(),
    };
}

export function createNoPriorityStrategyCredentials(): any {
    return {
        name: 'noPriority',
        work: (cdRef) => cdRef.detectChanges(),
        behavior: (work: any, scope: any) => {
            return (o$) =>
                o$.pipe(scheduleOnReactQueue(work, { priority:  NoPriority, scope }));
        },
    };
}

export function createImmediateStrategyCredentials(): any {
    return {
        name: 'immediate',
        work: (cdRef) => cdRef.detectChanges(),
        behavior: (work: any, scope: any) => {
            return (o$) =>
                o$.pipe(
                    scheduleOnReactQueue(work, { priority:  ImmediatePriority, scope })
                );
        },
    };
}

export function createUserBlockingStrategyCredentials(): any {
    return {
        name: 'userBlocking',
        work: (cdRef) => cdRef.detectChanges(),
        behavior: (work: any, scope: any) => {
            return (o$) =>
                o$.pipe(
                    scheduleOnReactQueue(work, { priority:  UserBlockingPriority, scope })
                );
        },
    };
}

export function createNormalStrategyCredentials(): any {
    return {
        name: 'normal',
        work: (cdRef) => cdRef.detectChanges(),
        behavior: (work: any, scope: any) => {
            return (o$) =>
                o$.pipe(
                    scheduleOnReactQueue(work, { priority:  NormalPriority, scope })
                );
        },
    };
}

export function createLowStrategyCredentials(): any {
    return {
        name: 'low',
        work: (cdRef) => cdRef.detectChanges(),
        behavior: (work: any, scope: any) => {
            return (o$) =>
                o$.pipe(scheduleOnReactQueue(work, { priority:  LowPriority, scope }));
        },
    };
}

export function createIdleStrategyCredentials(): any {
    return {
        name: 'idle',
        work: (cdRef) => cdRef.detectChanges(),
        behavior: (work: any, scope: any) => {
            return (o$) =>
                o$.pipe(
                    scheduleOnReactQueue(work, { priority:  IdlePriority, scope })
                );
        },
    };
}
