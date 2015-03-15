/*jslint node: true */
'use strict';


var http = require('http');
var path = require('path');
var log = console.log;

var childProcess = require('child_process');
var slimerjs = require('slimerjs');
console.log(slimerjs.path);

console.log(process.cwd());

childProcess.exec( slimerjs.path + ' ' + path.join(process.cwd(), 'headless.js'), function(err, stdout, stderr){
	if (err) {
		console.log('error with SlimmerJS startup', err.stack ||  err);
	} else {
		console.log('SlimmerJS started...');
	}
});

var config = require('./config.js');

var express = require('./express');

var service = function (req, res) {
	express (req, res);
};
var server = http.createServer( service );
server.listen( 3000 );

log('Server is listening on port: ', config.port);

process.on('uncaughtException', function(err) {
	log('Caught exception: ' + err, err.stack);
});