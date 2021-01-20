import { Injectable, OnDestroy } from '@angular/core';
import {EMPTY, merge, Observable, queueScheduler, Subject, Subscribable, Subscription} from 'rxjs';
import {catchError, mergeAll, observeOn, tap} from 'rxjs/operators';


export function isSubscription(obj: any): obj is Subscription {
  // The !! is to ensure that this publicly exposed function returns
  // `false` if something like `null` or `0` is passed.
  return !!obj && (obj instanceof Subscription);
}


export function createSideEffectObservable<T>(
    stateObservables = new Subject<Observable<T>>()
): {
  effects$: Observable<T>;
  nextEffectObservable: (effect$: Observable<T>) => void;
} & Subscribable<T> {
  const effects$: Observable<T> = merge(
      stateObservables.pipe(mergeAll(), observeOn(queueScheduler))
  );

  function nextEffectObservable(effect$: Observable<T>): void {
    stateObservables.next(effect$);
  }

  function subscribe(): Subscription {
    return effects$.subscribe();
  }

  return {
    effects$,
    nextEffectObservable,
    subscribe,
  };
}

@Injectable()
export class RxEffects implements OnDestroy {
  private readonly subscription;
  private readonly effectObservable = createSideEffectObservable();

  constructor() {
    this.subscription = this.effectObservable.subscribe();
  }

  /**
   * @description
   * Manages side-effects of your state. Provide an `Observable<any>` **side-effect** and an optional
   * `sideEffectFunction`.
   * Subscription handling is done automatically.
   *
   * @example
   * // Directly pass an observable side-effect
   * const localStorageEffect$ = changes$.pipe(
   *  tap(changes => storeChanges(changes))
   * );
   * state.hold(localStorageEffect$);
   *
   * // Pass an additional `sideEffectFunction`
   *
   * const localStorageEffectFn = changes => storeChanges(changes);
   * state.hold(changes$, localStorageEffectFn);
   *
   * @param {Observable<S>} obsOrObsWithSideEffectOrSubscription
   * @param {function} [sideEffectFn]
   */
  hold<S>(
    obsOrObsWithSideEffectOrSubscription: Observable<S> | Subscription,
    sideEffectFn?: (arg: S) => void
  ): void {
    if (isSubscription(obsOrObsWithSideEffectOrSubscription)) {
      this.subscription.add(obsOrObsWithSideEffectOrSubscription);
      return;
    } else if (typeof sideEffectFn === 'function') {
      this.effectObservable.nextEffectObservable(
        obsOrObsWithSideEffectOrSubscription.pipe(
          tap(sideEffectFn),
          catchError((e) => {
            console.error(e);
            return EMPTY;
          })
        )
      );
      return;
    }
    this.effectObservable.nextEffectObservable(obsOrObsWithSideEffectOrSubscription);
  }

  ngOnDestroy() {
    // tslint:disable-next-line:no-unused-expression
    this.subscription && this.subscription.unsubscribe();
  }
}
