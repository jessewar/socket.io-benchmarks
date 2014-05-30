var bench;

if (process.argv[2] == '1.0.0') {
  bench = require('socket.io-benchmarks-v1.0.0');
} else if (process.argv[2] == '0.9.16') {
  bench = require('socket.io-benchmarks-v0.9.16');
} else {
  console.log("Usage ./bench.js version transport");
  console.log("Where:");
  console.log("  'version' is the version of socket.io and socket.io-client to test (either 0.9.16 or 1.0.0)");
  console.log("  'transport' is the specific transport socket.io will be limited to");
  process.exit(1);
}

bench.run(process.argv[3]);