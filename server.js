var server = require('http').Server();
var ioc = require('socket.io-client');
var Benchmark = require('benchmark');
var io = require('./node_modules/socket-new/socket.io').listen(server);

// creates a socket.io client for the given server
function client(srv, nsp, opts) {
    if ('object' == typeof nsp) {
        opts = nsp;
        nsp = null;
    }
    var addr = srv.address();
    if (!addr) addr = srv.listen().address();
    var url = 'ws://' + addr.address + ':' + addr.port + (nsp || '');
    return ioc.connect(url, opts);
}

io.configure(function() {
    var transport = process.argv.length >= 3 ? process.argv[3] : null;
    if (transport) io.set('transports', [transport]);
    io.set('log level', 1);
});

io.sockets.on('connection', function(socket) {
    function jsonRoundtrip(deferred) {
        socket.emit('server-message', {name : "Server"});
        socket.on('client-message', function(data) {
            deferred.resolve();
            socket.removeAllListeners('client-message');
        });
    }

    var options = {
        'onStart' : function() { console.log("Testing SocketIO v0.9.16 using " + process.argv[3] + "..."); },
        'onComplete' : function() {
            console.log("Number of times test was executed: " + this.count + "\n" +
			"Numer of test cycles: " + this.cycles + "\n" + 
			"Mean execution time: " + this.stats.mean + "\n" +
			"Numer of executions per second: " + this.hz);
        },
        'defer' : true,
        'async' : true
    };
    var bench = new Benchmark('roundtrip', jsonRoundtrip, options);
    bench.run();
});


// connect to server triggering benchmark to start
var clientSocket = client(server);
clientSocket.on('server-message', function(data) {
    clientSocket.emit('client-message', data);
});
