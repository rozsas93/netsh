const app = require('http').createServer();
const io = require('socket.io')(app);
const fs = require('fs');
const {execSync} = require('child_process');
const hostile = require('hostile');

const port = 81;
app.listen(port);
console.log(`App listens on port: ${port}`);

io.on('connection', (socket) => {
    /** host things */
    socket.on('get host list', () => {
        socket.emit('host list', getHostFile());
    });

    socket.on('edit host', (host) => {
        editHost(host.ip, host.domain);
    });

    socket.on('delete host', (host) => {
        deleteHost(host.ip, host.domain);
    });

    /** proxy things */
    socket.on('get proxy list', () => {
        socket.emit('proxy list', getPortProxy());
    });

    socket.on('edit proxy', (proxy) => {
        editProxy(proxy.listenAddress, proxy.listenPort, proxy.connectAddress, proxy.connectPort);
    });

    socket.on('delete proxy', (proxy) => {
        deletePortProxy(proxy.listenAddress, proxy.listenPort);
    });
});

function getHostFile() {
    return hostile.getFile(hostile.HOSTS);
}

function deleteHost(ip, host) {
    return hostile.remove(ip, host);
}

function editHost(ip, host) {
    return hostile.set(ip, host);
}


function getPortProxy() {
    const cmd = `netsh interface portproxy show v4tov4`;
    let result = execSync(cmd).toString();

    return result.split('\r\n').filter(l => l).splice(3).map(e => e.replace(/ +/g, ' ').split( ' '));
}

function deletePortProxy(listenaddress, listenport) {
    const cmd = `netsh interface portproxy delete v4tov4 listenport=${listenport} listenaddress=${listenaddress}`;

    return execSync(cmd).toString();
}

function editProxy(listenaddress, listenport, connectaddress, connectport) {
    const cmd = `netsh interface portproxy add v4tov4 listenport=${listenport} listenaddress=${listenaddress} connectaddress=${connectaddress} connectport=${connectport}`;

    return execSync(cmd).toString();
}