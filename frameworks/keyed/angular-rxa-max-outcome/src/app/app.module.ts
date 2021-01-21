import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {RxForModule, UnpatchEventsModule, RX_PRIMARY_STRATEGY} from "@rx-angular";



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
      RxForModule
  ],
  providers: [
    {
      provide: RX_PRIMARY_STRATEGY,
      useValue: 'normal'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
