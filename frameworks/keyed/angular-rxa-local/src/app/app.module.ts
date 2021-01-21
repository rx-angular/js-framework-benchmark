import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {RxForModule, UnpatchEventsModule} from "@rx-angular";

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
