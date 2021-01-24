import {Component, VERSION} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {getData$} from "@data";

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
                        <h1>Angular {{version}} keyed (normal)</h1>
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
    model = getData$();
    data$ = this.model.data$;

    selected: number = undefined;

    backup: Array<Data> = undefined;
    version: string;

    buildData = this.model.buildData;
    delete = this.model.deleteItem;
    run = this.model.run;
    add = this.model.add;
    update = this.model.update;
    runLots = this.model.runLots;
    clear = this.model.clear;
    swapRows = this.model.swapRows;
    itemById = this.model.itemById;
    distinctById = this.model.distinctById;

    constructor() {
        this.version = VERSION.full;
    }

    select(item: Data, event: Event) {
        event.preventDefault();
        this.selected = item.id;
    }

}
