var http = require('http'); http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello CPS*3500\n');}).listen(8080);