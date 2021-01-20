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
      RxForModule,
      UnpatchEventsModule
  ],
  providers: [
    {
      provide: RX_PRIMARY_STRATEGY,
      useValue: 'native'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
