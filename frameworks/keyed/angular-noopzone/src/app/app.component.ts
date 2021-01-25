import {Component, VERSION, ɵmarkDirty} from '@angular/core';
import {getData} from "@data";


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
                        <h1>Angular {{version}} keyed (no zone.js)</h1>
                    </div>
                    <div class="col-md-6">
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="run" (click)="run()" ref="text">
                                Create 1,000 rows
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="runlots" (click)="runLots()">
                                Create 10,000 rows
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="add" (click)="add()" ref="text">
                                Append 1,000 rows
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="update" (click)="update()">
                                Update every 10th row
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="clear" (click)="clear()">Clear
                            </button>
                        </div>
                        <div class="col-sm-6 smallpad">
                            <button type="button" class="btn btn-primary btn-block" id="swaprows" (click)="swapRows()">
                                Swap Rows
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <table class="table table-hover table-striped test-data">
                <tbody>
                <tr [class.danger]="item.id === selected" *ngFor="let item of data; trackBy: itemById">
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
    model = getData();

    get data(): Array<Data>{
        return this.model.data();
    }

    selected: number = undefined;
    id: number = 1;
    backup: Array<Data> = undefined;
    version: string;

    constructor() {
        this.version = VERSION.full;
    }

    itemById = this.model.itemById;

    select(item: Data, event: Event) {
        event.preventDefault();
        this.selected = item.id;
        ɵmarkDirty(this);
    }

    delete(item: Data, event: Event) {
        this.model.deleteItem(item, event);
        ɵmarkDirty(this);
    }

    run() {
        this.model.run();
        console.log(this.model.data.length, this.data.length);
        ɵmarkDirty(this);
    }

    add() {
        this.model.add();
        ɵmarkDirty(this);
    }

    update() {
        this.model.update();
        ɵmarkDirty(this);
    }

    runLots() {
        this.model.runLots();
        this.selected = undefined;
        ɵmarkDirty(this);
    }

    clear() {
        this.model.clear();
        this.selected = undefined;
        ɵmarkDirty(this);
    }

    swapRows() {
        this.model.swapRows();
        ɵmarkDirty(this);
    }

}
