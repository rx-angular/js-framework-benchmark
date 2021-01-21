import {Component, VERSION} from '@angular/core';
import {BehaviorSubject} from "rxjs";

interface Data {
    id: number;
    label: string;
}

@Component({
    selector: 'app-root',
    template: `
        <div class="container">
            <div class="jumbotron">
                <div class="row">
                    <div class="col-md-6">
                        <h1>Angular {{version}} keyed (global)</h1>
                    </div>
                    <div class="col-md-6">
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="run" unpatch (click)="run()" ref="text">
                                Create 1,000 rows
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="runlots" unpatch (click)="runLots()">
                                Create 10,000 rows
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="add" unpatch (click)="add()" ref="text">
                                Append 1,000 rows
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="update" unpatch (click)="update()">
                                Update every 10th row
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="clear" unpatch (click)="clear()">Clear
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="swaprows" unpatch (click)="swapRows()">
                                Swap Rows
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <table class="table table-hover table-striped test-data">
                <tbody>
                <tr [class.danger]="item.id === selected" *rxFor="let item of data$; trackBy: itemById">
                    <td class="col-md-1">{{item.id}}</td>
                    <td class="col-md-4">
                        <a href="#" (click)="select(item, $event)">{{item.label}}</a>
                    </td>
                    <td class="col-md-1"><a href="#" (click)="delete(item, $event)"><span
                            class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>
                    <td class="col-md-6"></td>
                </tr>
                </tbody>
            </table>
            <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
        </div>
    `,
    styles: []
})
export class AppComponent {
    data$ = new BehaviorSubject<Array<Data>>([]);

    selected: number = undefined;
    id: number = 1;
    backup: Array<Data> = undefined;
    version: string;

    constructor() {
        this.version = VERSION.full;
    }

    buildData(count: number = 1000): Array<Data> {
        var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
        var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
        var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
        var data: Array<Data> = [];
        for (var i = 0; i < count; i++) {
            data.push({
                id: this.id,
                label: adjectives[this._random(adjectives.length)] + " " + colours[this._random(colours.length)] + " " + nouns[this._random(nouns.length)]
            });
            this.id++;
        }
        return data;
    }

    _random(max: number) {
        return Math.round(Math.random() * 1000) % max;
    }

    itemById(index: number, item: Data) {
        return item.id;
    }

    select(item: Data, event: Event) {
        event.preventDefault();
        this.selected = item.id;
    }

    delete(item: Data, event: Event) {
        event.preventDefault();
        const data = this.data$.getValue();
        for (let i = 0, l = data.length; i < l; i++) {
            if (data[i].id === item.id) {
                data.splice(i, 1);
                break;
            }
        }
        this.data$.next(data);
    }

    run() {
        this.data$.next(this.buildData());
    }

    add() {
        this.data$.next(this.data$.getValue().concat(this.buildData(1000)));
    }

    update() {
        const data = this.data$.getValue();
        for (let i = 0; i < data.length; i += 10) {
            data[i].label += ' !!!';
        }
        this.data$.next(data);
    }

    runLots() {
        this.data$.next(this.buildData(10000));
        this.selected = undefined;
    }

    clear() {
        this.data$.next([]);
        this.selected = undefined;
    }

    swapRows() {
        const data = this.data$.getValue();
        if (data.length > 998) {
            var a = data[1];
            data[1] = data[998];
            data[998] = a;
        }
        this.data$.next(data);
    }
}
