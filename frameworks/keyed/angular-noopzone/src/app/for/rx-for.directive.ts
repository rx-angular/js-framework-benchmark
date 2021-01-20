import {
  ChangeDetectorRef,
  Directive, ElementRef,
  Input,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  OnDestroy,
  OnInit,
  TemplateRef, TrackByFunction,
  ViewContainerRef,
} from '@angular/core';

import {isObservable, of, ReplaySubject, Subject} from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import {
  createListManager,
  ListManager, mergeStrategies,
} from './util/list-manager';
import { RxEffects } from './util/rx-effects.service';
import { RxForViewContext } from './model/view-context';
import {distinctUntilChanged, map, switchAll} from "rxjs/operators";
import {getDefaultStrategyCredentialsMap} from "./util/default.strategies";
import {getConcurrentSchedulerStrategyCredentialsMap} from "./util/concurrent.strategies";

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxFor]',
  providers: [RxEffects],
})
export class RxFor<T, U extends NgIterable<T> = NgIterable<T>>
  implements OnInit, OnDestroy {
  @Input()
  set rxFor(
    potentialObservable:
      | Observable<NgIterable<T>>
      | NgIterable<T>
      | null
      | undefined
  ) {
    this.observables$.next(potentialObservable);
  }

  @Input()
  set rxForOf(
    potentialObservable:
      | Observable<NgIterable<T>>
      | NgIterable<T>
      | null
      | undefined
  ) {
    this.observables$.next(potentialObservable);
  }

  @Input('rxForStrategy')
  set strategy(strategyName: string | Observable<string> | undefined) {
    this.strategyInput$.next(strategyName);
  }

  @Input('rxForParent') renderParent = false;

  @Input()
  set rxForTrackBy(trackByFnOrKey: string | ((idx: number, i: T) => any)) {
    this._trackBy =
      typeof trackByFnOrKey !== 'function'
        ? (i, a) => a[trackByFnOrKey]
        : trackByFnOrKey;
  }

  @Input()
  set rxForDistinctBy(distinctBy: (a: T, b: T) => boolean) {
    this._distinctBy = distinctBy;
  }

  @Input('rxForRenderCallback') set renderCallback(
    renderCallback: Subject<void>
  ) {
    this._renderCallback = renderCallback;
  }

  constructor(
    private iterableDiffers: IterableDiffers,
    private cdRef: ChangeDetectorRef,
    private eRef: ElementRef,
    private readonly templateRef: TemplateRef<RxForViewContext<T>>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly rxEf: RxEffects
  ) {}

  static ngTemplateGuard_rxFor: 'binding';

  private strategyInput$ = new ReplaySubject<string | Observable<string>>(1);
  private differ: IterableDiffer<T> | null = null;
  private observables$ = new ReplaySubject<
    Observable<NgIterable<T>> | NgIterable<T>
  >(1);
  private _renderCallback: Subject<any>;

  values$ = this.observables$.pipe( map(o => isObservable(o) ? o : of(o)),
      distinctUntilChanged(),
      switchAll(),
      distinctUntilChanged());

  strategy$ = this.strategyInput$.pipe( map(o => isObservable(o) ? o : of(o)),
      distinctUntilChanged(),
      switchAll(),
      distinctUntilChanged());

  private listManager: ListManager<T, RxForViewContext<T>>;

  /** @internal */
  static ngTemplateContextGuard<U>(
    dir: RxFor<U>,
    ctx: unknown | null | undefined
  ): ctx is RxForViewContext<U> {
    return true;
  }

  _trackBy: TrackByFunction<T> = (i, a) => a;
  _distinctBy = (a:T, b:T) => a === b;

  ngOnInit() {
    // this.differ = this.iterableDiffers.find([]).create(this._trackBy);
    this.listManager = createListManager<T, RxForViewContext<T>>({
      cdRef: this.cdRef,
      eRef: this.eRef,
      renderParent: this.renderParent,
      strategies: {...getConcurrentSchedulerStrategyCredentialsMap(), ...getDefaultStrategyCredentialsMap()},
      defaultStrategyName: 'normal',
      viewContainerRef: this.viewContainerRef,
      templateRef: this.templateRef,
      trackBy: this._trackBy,
      distinctBy: this._distinctBy,
      createViewContext: createViewContext as any,
    });
    this.listManager.nextStrategy(this.strategy$);
    this.rxEf.hold(this.listManager.render(this.values$), (v) => {
      this._renderCallback?.next(v);
    });
  }

  ngOnDestroy() {
    this.viewContainerRef.clear();
    console.log('onDestroy');
  }
}

function createViewContext<T>(item: T): RxForViewContext<T> {
  return new RxForViewContext<T>(item);
}
