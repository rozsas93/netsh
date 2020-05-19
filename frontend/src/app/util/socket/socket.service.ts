import {Injectable} from '@angular/core';
import {Socket} from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
})
export class SocketService {

    constructor(
        private socket: Socket
    ) {
    }

    getHostList() {
        return new Promise((resolve, reject) => {
            this.socket.on('host list', (data) => {
                resolve(data);
            });

            this.socket.emit('get host list');
        })
    }

    getProxyList() {
        return new Promise((resolve, reject) => {
            this.socket.on('proxy list', (data) => {
                resolve(data);
            });

            this.socket.emit('get proxy list');
        })
    }

    editHost(host: any) {
        this.socket.emit('edit host', host);
    }

    deleteHost(host: any) {
        this.socket.emit('delete host', host);
    }

    editProxy(proxy: any) {
        this.socket.emit('edit proxy', proxy);
    }

    deleteProxy(proxy: any) {
        this.socket.emit('delete proxy', proxy);
    }
}
