var server = require('http').Server();
var Benchmark = require('benchmark');
var ioc;
var io;

var version;
if (process.argv[2] == '1.0.0') {
  ioc = require('./node_modules/socket-new/socket.io-client');
  io = require('./node_modules/socket-new/socket.io')(server, {
    transports: ['polling', process.argv[3]] // need polling for initial transport
  });
  version = "1.0.0";
} else { // version 0.9.16
  ioc = require('socket.io-client');
  io = require('socket.io').listen(server);
  io.configure(function () {
    var transport = process.argv.length >= 3 ? process.argv[3] : null;
    if (transport) io.set('transports', [transport]);
    io.set('log level', 3);
  });
  version = "0.9.16";
}

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


io.sockets.on('connection', function (socket) {
  function jsonRoundtrip(deferred) {
    socket.emit('server-message', {
      name: "Server"
    });
    socket.on('client-message', function (data) {
      deferred.resolve();
      socket.removeAllListeners('client-message');
    });
  }

  var options = {
    onStart: function () {
      console.log("Testing SocketIO v" + version + " using " + process.argv[3] + "...");
    },
    onComplete: function () {
      console.log("Mean time for JSON message from server to client back to server: " + this.stats.mean + "\n" +
                  "Number of trips per second: " + this.hz);
    },
    defer: true,
    async: true
  };
  var bench = new Benchmark('roundtrip', jsonRoundtrip, options);
  bench.run();
});


// connect to server triggering benchmark to start
var clientSocket = client(server);
clientSocket.on('server-message', function (data) {
  clientSocket.emit('client-message', data);
})