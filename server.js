var express = require('express'),
    app = express(),
    serveStatic = require('serve-static'), // Serve static files
    path = require('path'),
    http= require('http'),
    httpServer = http.Server(app),
    argv = require("yargs").argv,
    proxyServer = require('http-route-proxy'),
    port = 8000,
    target = argv.dist ? '/ui/dist' : '/ui/src';

app.use(express.static(path.join(__dirname, target)));

app.use(serveStatic(path(__dirname, target), {
    'index': ['index.html']
}));

app.listen(port);

console.log('Listening on port' + port + '\nTarget' + target);