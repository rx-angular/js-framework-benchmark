import { ɵmarkDirty as markDirty } from '@angular/core';
import { tap } from 'rxjs/operators';

import { Observable } from 'rxjs';
export function getZoneUnPatchedApi<T = Function>(name: string, elem?: object): T {
    elem = elem || window;
    return isApiZonePatched(name, elem) ? elem['__zone_symbol__' + name] : elem[name];
}

export function isApiZonePatched(name: string, elem: object): boolean {
    // if symbol is present, zone patched the API
    return elem['__zone_symbol__' + name] !== undefined;
}

export function requestAnimationFrame(cb: () => void): number {
    return getZoneUnPatchedApi('requestAnimationFrame')(cb);
}

export function cancelAnimationFrame(id: number): void {
    getZoneUnPatchedApi('cancelAnimationFrame')(id);
}


export const animationFrameTick = () =>
    new Observable<number>((subscriber) => {
        const id = requestAnimationFrame(() => {
            subscriber.next(0);
            subscriber.complete();
        });
        return () => {
            cancelAnimationFrame(id);
        };
    });

import {
    MonoTypeOperatorFunction,
    Observer,
    SubscribableOrPromise,
    Subscriber,
    Subscription,
    Unsubscribable
} from 'rxjs';
type KeyOf<O> = keyof O & string & symbol & number;

/*
 * createPropertiesWeakMap
 *
 * @param getDefaults: (o: O) => P
 * Example:
 *
 * export interface Properties {
 *   isCoalescing: boolean;
 * }
 *
 * const obj: object = {
 *   foo: 'bar',
 *   isCoalescing: 'weakMap version'
 * };
 *
 * const getDefaults = (ctx: object): Properties => ({isCoalescing: false});
 * const propsMap = createPropertiesWeakMap<object, Properties>(getDefaults);
 *
 * console.log('obj before:', obj);
 * // {foo: "bar", isCoalescing: "weakMap version"}
 * console.log('props before:', propsMap.getProps(obj));
 * // {isCoalescing: "weakMap version"}
 *
 * propsMap.setProps(obj, {isCoalescing: true});
 * console.log('obj after:', obj);
 * // {foo: "bar", isCoalescing: "weakMap version"}
 * console.log('props after:', propsMap.getProps(obj));
 * // {isCoalescing: "true"}
 * */
export function createPropertiesWeakMap<O extends object, P extends object>(
    getDefaults: (o: O) => P
) {
    type K = KeyOf<P>;
    const propertyMap = new WeakMap<O, P>();

    return {
        getProps: getProperties,
        setProps: setProperties
    };

    function getProperties(ctx: O): P {
        const defaults = getDefaults(ctx);
        const propertiesPresent: P | undefined = propertyMap.get(ctx);
        let properties: P;

        if (propertiesPresent !== undefined) {
            properties = propertiesPresent;
        } else {
            properties = {} as P;

            (Object.entries(defaults) as [K, P[K]][]).forEach(
                ([prop, value]): void => {
                    properties[prop] = hasKey(ctx, prop) ? ctx[prop] : value;
                }
            );

            propertyMap.set(ctx, properties);
        }
        return properties;
    }

    function setProperties(ctx: O, props: Partial<P>): P {
        const properties: P = getProperties(ctx);
        (Object.entries(props) as [K, P[K]][]).forEach(([prop, value]) => {
            properties[prop] = value;
        });
        propertyMap.set(ctx, properties);
        return properties;
    }

    function hasKey(ctx: O, property: K): ctx is K {
        return ctx[property] != null;
    }
}


interface CoalescingContextProps {
    numCoalescingSubscribers: number;
}

interface CoalescingManager {
    decrement: (scope: object) => void,
    increment: (scope: object) => void,
    isCoalescing: (scope: object) => boolean,
}

export const coalescingManager = createCoalesceManager();

const coalescingContextPropertiesMap = createPropertiesWeakMap<object,
    CoalescingContextProps>((ctx) => ({
    numCoalescingSubscribers: 0
}));

/**
 * @describe createCoalesceManager
 *
 * returns a
 * Maintains a weak map of component references ans flags
 * them if the coalescing process is already started for them.
 *
 * Used in render aware internally.
 */
function createCoalesceManager(): CoalescingManager {
    return {
        decrement,
        increment,
        isCoalescing
    };

    // Decrements the number of subscriptions in a scope e.g. a class instance
    function decrement(scope: object): void {
        const numCoalescingSubscribers = coalescingContextPropertiesMap
            .getProps(scope).numCoalescingSubscribers - 1;
        coalescingContextPropertiesMap
            .setProps(scope, { numCoalescingSubscribers: numCoalescingSubscribers >= 0 ? numCoalescingSubscribers : 0 });
    }

    // Increments the number of subscriptions in a scope e.g. a class instance
    function increment(scope: object): void {
        const numCoalescingSubscribers =
            coalescingContextPropertiesMap
                .getProps(scope).numCoalescingSubscribers + 1;
        coalescingContextPropertiesMap
            .setProps(scope, { numCoalescingSubscribers });
    }

    // Checks if anybody else is already coalescing atm (number > 0)
    function isCoalescing(scope: object): boolean {
        return (
            coalescingContextPropertiesMap
                .getProps(scope).numCoalescingSubscribers > 0
        );
    }
}


/**
 * @description
 * Limits the number of synchronous emitted a value from the source Observable to
 * one emitted value per
 *   [`AnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), then repeats
 *   this process for every tick of the browsers event loop.
 *
 * The coalesce operator is based on the [throttle](https://rxjs-dev.firebaseapp.com/api/operators/throttle) operator.
 * In addition to that is provides emitted values for the trailing end only, as well as maintaining a context to scope
 *   coalescing.
 *
 * @param {function(value: T): SubscribableOrPromise} durationSelector - A function
 * that receives a value from the source Observable, for computing the silencing
 * duration for each source value, returned as an Observable or a Promise.
 * It defaults to `requestAnimationFrame` as durationSelector.
 * @param {Object} config - A configuration object to define `leading` and `trailing` behavior and the context object.
 * Defaults to `{ leading: false, trailing: true }`. The default scoping is per subscriber.
 * @return {Observable<T>} An Observable that performs the coalesce operation to
 * limit the rate of emissions from the source.
 *
 * @usageNotes
 * Emit clicks at a rate of at most one click per second
 * ```typescript
 * import { fromEvent, animationFrames } from 'rxjs';
 * import { coalesce } from 'ngRx/component';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(coalesce(ev => animationFrames));
 * result.subscribe(x => console.log(x));
 * ```
 */
export function coalesceWith<T>(
    durationSelector: Observable<any>,
    scope?: object
): MonoTypeOperatorFunction<T> {
    // tslint:disable-next-line:variable-name
    const _scope = scope || {};

    return (source) => {
        const o$ = new Observable<T>((observer) => {
            const rootSubscription = new Subscription();
            rootSubscription.add(
                source.subscribe(createInnerObserver(observer, rootSubscription))
            );
            return rootSubscription;
        });

        return o$;

        function createInnerObserver(
            outerObserver: Subscriber<T>,
            rootSubscription: Subscription
        ): Observer<T> {
            let actionSubscription: Unsubscribable;
            let latestValue: T | undefined;

            const tryEmitLatestValue = () => {
                if (actionSubscription) {
                    // We only decrement the number if it is greater than 0 (isCoalescing)
                    coalescingManager.decrement(_scope);
                    if (!coalescingManager.isCoalescing(_scope)) {
                        outerObserver.next(latestValue);
                    }
                }
            };
            return {
                complete: () => {
                    tryEmitLatestValue();
                    outerObserver.complete();
                },
                error: (error) => outerObserver.error(error),
                next: (value) => {
                    latestValue = value;
                    if (!actionSubscription) {
                        // tslint:disable-next-line:no-unused-expression
                        coalescingManager.increment(_scope);
                        actionSubscription = durationSelector.subscribe({
                            error: (error) => outerObserver.error(error),
                            next: () => {
                                tryEmitLatestValue();
                                actionSubscription.unsubscribe();
                                actionSubscription = undefined;
                            },
                            complete: () => {
                                tryEmitLatestValue();
                                actionSubscription = undefined;
                            }
                        });
                        rootSubscription.add(new Subscription(() => {
                            tryEmitLatestValue();
                            if (actionSubscription) {
                                actionSubscription.unsubscribe();
                                actionSubscription = undefined;
                            }
                        }));
                    }
                }
            };
        }
    };
}

export function getDefaultStrategyCredentialsMap(): any {
    return {
        global: globalCredentials,
        native: nativeCredentials,
        noop: noopCredentials,
        local: localCredentials
    };
}

const localCredentials: any = {
    name: 'local',
    // @ts-ignore
    work: (cdRef, _, notification) => {
        cdRef.detectChanges();
    },
    // @ts-ignore
    behavior: (work: any, scope) => o$ => o$.pipe(
        coalesceWith(animationFrameTick(), scope),
        tap(() => work())
    )
};

const globalCredentials: any = {
    name: 'global',
    // @ts-ignore
    work: (_, context) => markDirty(context),
    // @ts-ignore
    behavior: (work: any) => o$ => o$.pipe(tap(() => work()))
};

// @ts-ignore
const noopCredentials: any = {
    name: 'noop',
    // @ts-ignore
    work: () => void 0,
    // @ts-ignore
    behavior: () => o$ => o$
};

const nativeCredentials: any = {
    name: 'native',
    // @ts-ignore
    work: (cdRef) => cdRef.markForCheck(),
    // @ts-ignore
    behavior: (work: any) => o$ => o$.pipe(tap(() => work()))
};

