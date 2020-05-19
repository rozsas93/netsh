import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {SocketIoModule, SocketIoConfig} from 'ngx-socket-io';
import {TableComponent} from './util/table/table.component';
import {TreeModule} from "angular-tree-component";

const config: SocketIoConfig = {url: 'http://localhost:81', options: {}};

@NgModule({
    declarations: [
        AppComponent,
        TableComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        TreeModule.forRoot(),
        SocketIoModule.forRoot(config)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
