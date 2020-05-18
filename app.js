const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const fs = require('fs');
const {exec} = require('child_process');

app.listen(80);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.on('connection', (socket) => {
    sendList();

    socket.on('netsh get list', async (data) => {
        sendList();
    });

    socket.on('netsh add', (data) => {
        const cmd = `netsh interface portproxy add v4tov4 listenport=${data.listenPort} listenaddress=${data.listenAddress} connectport=${data.connectPort} connectaddress=${data.connectAddress}`;

        exec(cmd, (err, stdout, stderr) => {
            sendList();
        });
    });

    socket.on('netsh delete', (data) => {
        const cmd = `netsh interface portproxy delete v4tov4 listenport=${data.listenPort} listenaddress=${data.listenAddress}`;

        exec(cmd, (err, stdout, stderr) => {
            sendList();
        });
    });

    function sendList() {
        exec('netsh interface portproxy show all', (err, stdout, stderr) => {
            socket.emit('netsh list', stdout);
        });
    }
});