import {
  asapScheduler,
  combineLatest,
  isObservable,
  merge,
  Observable,
  of,
  OperatorFunction,
  ReplaySubject,
} from 'rxjs';

import {distinctUntilChanged, publish, switchAll, tap} from 'rxjs/operators';
import { concat, NEVER} from 'rxjs';


import {
  ChangeDetectorRef,
  ElementRef,
  EmbeddedViewRef,
  NgIterable,
  TemplateRef,
  TrackByFunction, Type,
  ViewContainerRef,
  ɵdetectChanges as detectChanges
} from '@angular/core';
import {delay, filter, map, startWith, switchMap, withLatestFrom,} from 'rxjs/operators';


// Below are constants for LView indices to help us look up LView members
// without having to remember the specific indices.
// Uglify will inline these when minifying so there shouldn't be a cost.
export const HOST = 0;
export const TVIEW = 1;
export const FLAGS = 2;
export const PARENT = 3;
export const NEXT = 4;
export const TRANSPLANTED_VIEWS_TO_REFRESH = 5;
export const T_HOST = 6;
export const CLEANUP = 7;
export const L_CONTAINER_NATIVE = 7;
export const CONTEXT = 8;
export const INJECTOR = 9;
export const RENDERER_FACTORY = 10;
export const RENDERER = 11;
export const SANITIZER = 12;
export const CHILD_HEAD = 13;
export const CHILD_TAIL = 14;
// FIXME(misko): Investigate if the three declarations aren't all same thing.
export const DECLARATION_VIEW = 15;
export const DECLARATION_COMPONENT_VIEW = 16;
export const DECLARATION_LCONTAINER = 17;
export const PREORDER_HOOK_FLAGS = 18;
export const QUERIES = 19;
/**
 * Size of LView's header. Necessary to adjust for it when setting slots.
 *
 * IMPORTANT: `HEADER_OFFSET` should only be referred to the in the `ɵɵ*` instructions to translate
 * instruction index into `LView` index. All other indexes should be in the `LView` index space and
 * there should be no need to refer to `HEADER_OFFSET` anywhere else.
 */
export const HEADER_OFFSET = 20;

export const enum TViewType {
  /**
   * Root `TView` is the used to bootstrap components into. It is used in conjunction with
   * `LView` which takes an existing DOM node not owned by Angular and wraps it in `TView`/`LView`
   * so that other components can be loaded into it.
   */
  Root = 0,

  /**
   * `TView` associated with a Component. This would be the `TView` directly associated with the
   * component view (as opposed an `Embedded` `TView` which would be a child of `Component` `TView`)
   */
  Component = 1,

  /**
   * `TView` associated with a template. Such as `*ngIf`, `<ng-template>` etc... A `Component`
   * can have zero or more `Embedede` `TView`s.
   */
  Embedded = 2,
}


export function getTNode(cdRef: any, native: any /*Comment*/) {
  const lView = cdRef._cdRefInjectingView;
  const tView = lView[TVIEW];
  let i = HEADER_OFFSET;
  let lContainer;
  while (!lContainer && i <= tView['bindingStartIndex']) {
    const candidate = lView[i];
    if (candidate && candidate[L_CONTAINER_NATIVE] === native) {
      lContainer = candidate;
    }
    i++;
  }
  return lContainer[T_HOST];
}

export function extractProjectionParentViewSet(cdRef: any, tNode: any): Set<Type<any>> {
  const injectingLView = (cdRef as any)._cdRefInjectingView;
  const injectingTView = injectingLView[1];
  const components = new Set<number>(injectingTView['components']);
  const parentElements = new Set<Type<any>>();
  let parent = tNode['parent'];
  while (parent != null && components.size > 0) {
    const idx = parent['index'];
    if (components.has(idx)) {
      components.clear();
      parentElements.add(injectingLView[idx][CONTEXT]);
    }
    parent = parent['parent'];
  }
  return parentElements;
}

export function extractProjectionViews(cdRef: any, tNode: any): Type<any>[] {
  return Array.from(extractProjectionParentViewSet(cdRef, tNode));
}

export function renderProjectionParents(
    cdRef: any,
    tNode: any,
    strategy$: Observable<any>)
    : OperatorFunction<any, any> {

  return o$ => o$.pipe(
      withLatestFrom(strategy$),
      switchMap(([_, strategy]) => {
        const parentElements = extractProjectionParentViewSet(cdRef, tNode);
        const behaviors = [];
        for (const el of parentElements.values()) {
          behaviors.push(
              onStrategy(
                  el,
                  strategy,
                  (value, work, options) => {
                    detectChanges(el);
                  },
                  { scope: el }
              )
          )
        }
        behaviors.push(
            onStrategy(
                null,
                strategy,
                (value, work, options) => work(cdRef, options.scope),
                { scope: (cdRef as any).context || cdRef }
            )
        );

        return merge(...behaviors);
      })
  )
}


export interface ListManager<T, C> {
    nextStrategy: (config: string | Observable<string>) => void;

    render(changes$: Observable<NgIterable<T>>): Observable<any>;
}

export type CreateViewContext<T, C> = (item: T) => C;
export type DistinctByFunction<T> = (oldItem: T, newItem: T) => any;

export function nameToStrategyCredentials(strategies: any, defaultStrategyName: string) {
  return (o$: Observable<string>): Observable<any> => o$.pipe(
      map(name => Object.keys(strategies).includes(name) ? strategies[name] : strategies[defaultStrategyName])
  );
}

export function mergeStrategies(...strategiesArray: Array<any>): any {
  return strategiesArray.reduce((c, a) => {
    // tslint:disable-next-line:variable-name
    const _a = Array.isArray(a) ? strategiesArray.reduce((_c, __a) => ({ ..._c, ...__a }), {}) : a || {};
    return { ...c, ..._a };
  }, {});
}

export function observeTemplateByNotificationKind<U>(templateObserver: any) {
  return o$ => o$.pipe(tap((n: any) => {
    if (n.kind === 'rxError') {
      templateObserver.error(n.error);
    } else if (n.kind === 'rxComplete') {
      templateObserver.complete();
    } else if (n.kind === 'txNext') {
      templateObserver.next(n.value);
    } else if (n.kind === 'rxSuspense') {
      templateObserver.suspense(n.value);
    }
  }));
}

export function applyStrategy<T>(
    credentials$: Observable<any>,
    getContext: (v?: any) => any,
    getCdRef: (k: any) => ChangeDetectorRef
): (o$: Observable<any>) => Observable<any> {
  return notification$ => notification$.pipe(
      publish((n$) =>
          credentials$.pipe(
              switchMap((credentials) => n$.pipe(
                  switchMap(notification => {
                    const activeEmbeddedView = getCdRef(notification);
                    const context = getContext(notification);
                    const work = () => credentials.work(activeEmbeddedView, context, notification);
                    return concat(of(notification), NEVER).pipe(
                        credentials.behavior(work, context)
                    );
                  })
                  )
              )
          )
      )
  );
}

export function applyStrategy2<T>(
    strategy$: Observable<any>,
    workFactory: (value: T, work: any) => void,
    context: any
) {
  return (o$: Observable<T>) =>
      o$.pipe(
          withLatestFrom(strategy$),
          switchMap(([value, strategy]) => {
            return strategy.behavior(
                () => workFactory(value, strategy.work),
                context
            )(of(value));
          })
      );
}

export function onStrategy<T>(
    value: T,
    strategy: any,
    workFactory: (value: T, work: any, options: {scope?: any}) => void,
    options: {scope?: any}
) {
  return of(value).pipe(
      strategy.behavior(
          () => workFactory(value, strategy.work, options),
          options.scope || {}
      )
  );
}


export function createListManager<T, C extends any>(config: {
    cdRef: ChangeDetectorRef;
    eRef: ElementRef;
    renderParent: boolean;
    strategies: any;
    defaultStrategyName: string;
    viewContainerRef: ViewContainerRef;
    templateRef: TemplateRef<C>;
    createViewContext: CreateViewContext<T, C>;
    trackBy: TrackByFunction<T>;
    distinctBy?: DistinctByFunction<T>;
}): ListManager<T, C> {
    const {
        viewContainerRef,
        templateRef,
        createViewContext,
        defaultStrategyName,
        strategies,
        trackBy,
        cdRef,
        renderParent,
        eRef,
    } = config;
    const distinctBy = config?.distinctBy || ((a: T, b: T) => a === b);
    const scope = (cdRef as any).context || cdRef;
    const viewCache = [];

    const strategyName$ = new ReplaySubject<Observable<string>>(1);
    const strategy$: Observable<any> = strategyName$.pipe(
        map(o => isObservable(o) ? o : of(o)),
        distinctUntilChanged(),
        switchAll(),
        distinctUntilChanged(),
        startWith(defaultStrategyName),
        nameToStrategyCredentials(strategies, defaultStrategyName)
    );
    let tNode: any;

    return {
        nextStrategy(nextConfig: Observable<string>): void {
            strategyName$.next(nextConfig);
        },
        render(values$: Observable<NgIterable<T>>): Observable<any> {
            tNode = getTNode(cdRef, eRef.nativeElement);
            return values$.pipe(render());
        },
    };

    function render(): OperatorFunction<NgIterable<T>, any> {
        let count = 0;
        const positions = new Map<T, number>();

        return (o$: Observable<NgIterable<T>>): Observable<any> =>
            o$.pipe(
                map((items) => (items ? Array.from(items) : [])),
                withLatestFrom(strategy$),
                switchMap(([items, strategy]) => {
                    const viewLength = viewContainerRef.length;
                    let toRemoveCount = viewLength - items.length;
                    const insertedOrRemoved = toRemoveCount > 0 || count !== items.length;
                    const notifyParent = insertedOrRemoved && renderParent;
                    count = items.length;
                    const remove$ = [];
                    let i = viewLength;
                    while (i > 0 && toRemoveCount > 0) {
                        toRemoveCount--;
                        i--;
                        remove$.push(
                            onStrategy(
                                i,
                                strategy,
                                (value, work, options) => removeView(value),
                                {}
                            )
                        );
                    }
                    return combineLatest([
                        ...items.map((item, index) => {
                            positions.set(item, index);
                            const context: any = {count, index};
                            // flag which tells if a view needs to be updated
                            let doWork = false;
                            return of(item).pipe(
                                strategy.behavior(() => {
                                    // get the reference of the current `EmbeddedViewRef` at the index of the item
                                    let view = viewContainerRef.get(index) as EmbeddedViewRef<C>;
                                    if (!view) {
                                        // The items view is not created yet => create view + update context
                                        view = insertView(item, index, context);
                                        doWork = true;
                                    } else {
                                        // The items view is present => check what to do
                                        // the current `T` of the `EmbeddedViewRef`
                                        // @ts-ignore
                                      const entity = view.context.$implicit;
                                        // the `identity` of the `EmbeddedViewRef`
                                        const trackById = trackBy(index, entity);
                                        // the `identity` of the current item `T`
                                        const currentId = trackBy(index, item);
                                        // an item is moved if the current `identity` of the `EmbeddedView` is not the same as the
                                        // current item `T`
                                        const moved = trackById !== currentId;
                                        if (moved) {
                                            const oldPosition = positions.get(item);
                                            if (
                                                positions.has(item) &&
                                                positions.get(item) !== index
                                            ) {
                                                const oldView = <EmbeddedViewRef<C>>(
                                                    viewContainerRef.get(oldPosition)
                                                );
                                                if (oldView) {
                                                    view = moveView(oldView, index);
                                                }
                                            }
                                            updateViewContext(view, context, item);
                                            doWork = true;
                                        } else {
                                            // @ts-ignore
                                          const updated = !distinctBy(view.context.$implicit, item);
                                            if (updated) {
                                                updateViewContext(view, context, item);
                                                doWork = true;
                                            } else if (insertedOrRemoved) {
                                                // @ts-ignore
                                              view.context.setComputedContext(context);
                                            }
                                        }
                                    }
                                    if (doWork) {
                                        view.reattach();
                                        view.detectChanges();
                                        view.detach();
                                    }
                                }, {})
                            );
                        }),
                        ...remove$,
                        insertedOrRemoved
                            ? onStrategy(
                            i,
                            strategy,
                            (value, work, options) => work(cdRef, options.scope),
                            {scope}
                            ).pipe(map(() => null), filter(v => v != null), startWith(null))
                            : [],
                    ]).pipe(
                        // @NOTICE: dirty hack to do ??? ask @HoebblesB
                        delay(0, asapScheduler),
                        switchMap((v) => {
                            if (!notifyParent) {
                                return of(v);
                            }
                            const parentElements = extractProjectionParentViewSet(cdRef, tNode);
                            const behaviors = [];
                            for (const el of parentElements.values()) {
                                behaviors.push(
                                    onStrategy(
                                        el,
                                        strategy,
                                        (value, work, options) => {
                                            detectChanges(el);
                                        },
                                        {scope: el}
                                    )
                                )
                            }
                            if (behaviors.length === 0) {
                                return of(v);
                            }
                            behaviors.push(
                                onStrategy(
                                    null,
                                    strategy,
                                    (value, work, options) => work(cdRef, options.scope),
                                    {scope: (cdRef as any).context || cdRef}
                                )
                            );
                            return combineLatest(behaviors).pipe(
                                map(() => null),
                                filter((_v) => _v !== null),
                                startWith(v)
                            );
                        }),
                        filter((v) => v != null),
                        // tap((v) => console.log('end', v))
                    );
                })
            );
    }

    function updateViewContext(
        view: EmbeddedViewRef<C>,
        context: any,
        item: T
    ): void {
        // @ts-ignore
      view.context.setComputedContext(context);
        // @ts-ignore
      view.context.$implicit = item;
    }

    function moveView(
        view: EmbeddedViewRef<C>,
        index: number
    ): EmbeddedViewRef<C> {
        return viewContainerRef.move(view, index) as EmbeddedViewRef<C>;
    }

    function removeView(index: number): void {
        // TODO: evaluate viewCache with `detach` instead of `remove` viewCache.push();
        viewContainerRef.remove(index);
    }

    function insertView(
        item: T,
        index: number,
        context: any
    ): EmbeddedViewRef<C> {
        // TODO: evaluate viewCache with `detach` instead of `remove` viewCache.push();
        /*const existingView: EmbeddedViewRef<C> = viewCache.pop();
        let newView = existingView;
        if (existingView) {
          viewContainerRef.insert(existingView, index);
        } else {
          newView = viewContainerRef.createEmbeddedView(
            templateRef,
            createViewContext(item),
            index
          );
        }*/
        const newView = viewContainerRef.createEmbeddedView(
            templateRef,
            createViewContext(item),
            index
        );
        updateViewContext(newView, context, item);
        return newView;
    }
}
