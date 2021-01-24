import {BehaviorSubject} from "rxjs";
import {Data} from "./model";

export interface DataService {
    data$?: BehaviorSubject<Array<Data>>,
    data?: Array<Data>,
    run: () => void,
    buildData: () => Array<Data>,
    add: () => void,
    update: () => void,
    deleteItem: (item:Data, event:Event) => void,
    runLots: () => void,
    clear: () => void,
    swapRows: () => void,
    itemById: (index: number, item: Data) => number;
    distinctById: (item1: Data, item2: Data) => boolean;
}

export function getData$(): DataService {

    let id: number = 1;
    const data$ = new BehaviorSubject<Array<Data>>([]);

    return {
        data$,
        run,
        buildData,
        add,
        update,
        deleteItem,
        runLots,
        clear,
        swapRows,
        itemById,
        distinctById
    }

    function itemById(index: number, item: Data): number {
        return item.id;
    }

    function distinctById(item1: Data, item2: Data): boolean {
        return item1.label !== item2.label;
    }

    function buildData(count: number = 1000): Array<Data> {
        var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
        var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
        var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
        var data: Array<Data> = [];
        for (var i = 0; i < count; i++) {
            data.push({
                id: id,
                label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)]
            });
            id++;
        }
        return data;
    }

    function _random(max: number) {
        return Math.round(Math.random() * 1000) % max;
    }

    function deleteItem(item:Data, event:Event) {
        event.preventDefault();
        const data = data$.getValue();
        for (let i = 0, l = data.length; i < l; i++) {
            if (data[i].id === item.id) {
                data.splice(i, 1);
                break;
            }
        }
        data$.next(data);
    }

    function run() {
        data$.next(buildData());
    }

    function add() {
        data$.next(data$.getValue().concat(buildData(1000)));
    }

    function update() {
        const data = data$.getValue();
        for (let i = 0; i < data.length; i += 10) {
            data[i].label += ' !!!';
        }
        data$.next(data);
    }

    function runLots() {
        data$.next(buildData(10000));
       // selected = undefined;
    }

    function clear() {
        data$.next([]);
      //  selected = undefined;
    }

    function swapRows() {
        const data = data$.getValue();
        if (data.length > 998) {
            var a = data[1];
            data[1] = data[998];
            data[998] = a;
        }
        data$.next(data);
    }
}

export function getData(): DataService {

    let id: number = 1;
    let data: Array<Data> = [];

    return {
        data,
        run,
        buildData,
        add,
        update,
        deleteItem,
        runLots,
        clear,
        swapRows,
        itemById,
        distinctById
    }

    function itemById(index: number, item: Data): number {
        return item.id;
    }

    function distinctById(item1: Data, item2: Data): boolean {
        return item1.label !== item2.label;
    }

    function buildData(count: number = 1000): Array<Data> {
        var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
        var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
        var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
        var data: Array<Data> = [];
    for (var i = 0; i < count; i++) {
        data.push({ id: id, label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)] });
        id++;
    }
    return data;
}

    function  _random(max: number) {
        return Math.round(Math.random() * 1000) % max;
    }

    function  deleteItem(item: Data, event: Event) {
        event.preventDefault();
        for (let i = 0, l = data.length; i < l; i++) {
            if (data[i].id === item.id) {
                data.splice(i, 1);
                break;
            }
        }
    }

    function  run() {
        data = buildData();
    }

    function  add() {
        data = data.concat(buildData(1000));
    }

    function  update() {
        for (let i = 0; i < data.length; i += 10) {
            data[i].label += ' !!!';
        }
    }

    function   runLots() {
        data = buildData(10000);
      //  selected = undefined;
    }

    function  clear() {
        data = [];
       // selected = undefined;
    }

    function  swapRows() {
        if (data.length > 998) {
            var a = data[1];
            data[1] = data[998];
            data[998] = a;
        }
    }

}
