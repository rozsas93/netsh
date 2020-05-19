import {AfterViewInit, Component, Host, OnInit, ViewChild} from '@angular/core';
import {SocketService} from "./util/socket/socket.service";
import {TableData} from "./util/table/table.component";
import {TREE_ACTIONS} from "angular-tree-component";

export interface HostData {
    ip: string,
    domain: string;
}

export interface ProxyData {
    listenAddress: string;
    listenPort: string;
    connectAddress: string;
    connectPort: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('tree') tree;
    summaryData: any = [];
    summaryDataOptions = {
        actionMapping: {
            mouse: {
                click: (tree, node, $event) => {
                    if (node.hasChildren) TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
                },
                dblClick: (tree, node, event) => {
                    if (!node.hasChildren) {
                        const data = node.data.data;
                        if(!data) {
                            return;
                        }

                        switch (node.parent.data.name) {
                            case 'domains':
                                this.hostDataTable.startEdit(data);
                                break;
                            case 'portProxies':
                                this.portProxyDataTable.startEdit(data);
                                break;
                            default:
                                throw Error('Something went wrong!');
                        }
                    }
                },
                contextMenu: (tree, node, event) => {
                    event.preventDefault();

                    if (!node.hasChildren) {
                        const data = node.data.data;
                        if(!data) {
                            return;
                        }

                        switch (node.parent.data.name) {
                            case 'domains':
                                this.hostDataTable.add(data);
                                break;
                            case 'portProxies':
                                this.portProxyDataTable.add(data);
                                break;
                            default:
                                throw Error('Something went wrong!');
                        }
                    }
                }
            }
        },
    };

    @ViewChild('host') hostDataTable;
    hostTable: TableData<HostData>;

    @ViewChild('portProxy') portProxyDataTable;
    proxyTable: TableData<ProxyData>;

    constructor(private socketService: SocketService) {
    }

    ngOnInit() {
        this.loadData();
    }

    async loadData() {
        await Promise.all([this.createHostList(), this.createProxyList()]);

        this.createSummaryTable();
    }

    async createSummaryTable() {
        this.summaryData = [];

        let ips = [...this.hostTable.data.map(h => h.ip), ...this.proxyTable.data.map(p => p.listenAddress)];
        ips = ips.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });

        ips.map(ip => {
            const domains = [];
            const portProxies = [];

            this.hostTable.data.map(h => {
                if (h.ip === ip) {
                    domains.push({
                        name: h.domain,
                        data: h,
                    });
                }
            });

            this.proxyTable.data.map(p => {
                if (p.listenAddress === ip) {
                    portProxies.push({
                        name: `Listen address:\t\t${p.listenAddress}\nListen port:\t\t\t${p.listenPort}\nConnect address:\t\t${p.connectAddress}\nConnect port:\t\t\t${p.connectPort}`,
                        data: p,
                    });
                }
            });

            this.summaryData.push({
                name: ip,
                children: [
                    {
                        name: 'domains',
                        children: domains
                    },
                    {
                        name: 'portProxies',
                        children: portProxies
                    }
                ],
            })
        });


        setTimeout(() => {
            this.tree.treeModel.expandAll();
        }, 150);

    }

    async createHostList() {
        const hostList = await this.socketService.getHostList() as any[];

        const header = [
            {title: 'IP', property: 'ip', editable: false},
            {title: 'Domain', property: 'domain'},
        ];

        const data = hostList.map(host => {
            const [ip, domain] = host;
            return {ip, domain};
        });

        this.hostTable = {
            title: 'Hosts',
            data: data,
            header: header
        }
    }

    async createProxyList() {
        const proxyList = await this.socketService.getProxyList() as any[];

        const header = [
            {title: 'Listen address', property: 'listenAddress', editable: false},
            {title: 'Listen port', property: 'listenPort'},
            {title: 'Connect address', property: 'connectAddress'},
            {title: 'Connect port', property: 'connectPort'}
        ];

        const data = proxyList.map(host => {
            const [listenAddress, listenPort, connectAddress, connectPort] = host;
            return {listenAddress, listenPort, connectAddress, connectPort};
        });

        this.proxyTable = {
            title: 'Proxy',
            data: data,
            header: header
        }
    }

    onEditHost(host) {
        this.socketService.deleteHost(host.oldData);
        this.socketService.editHost(host.newData);

        this.loadData();
    }

    onDeleteHost(host) {
        this.socketService.deleteHost(host);

        this.loadData();
    }

    onEditProxy(proxy) {
        this.socketService.editProxy(proxy.newData);

        this.loadData();
    }

    onDeleteProxy(proxy) {
        this.socketService.deleteProxy(proxy);

        this.loadData();
    }
}
