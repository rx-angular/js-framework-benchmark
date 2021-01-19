import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {RxForModule} from "./for";
import {UnpatchEventsModule} from "./unpatch";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
      RxForModule,
      UnpatchEventsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
