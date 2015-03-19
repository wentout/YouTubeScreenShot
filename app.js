/*jslint node: true */
'use strict';


var http = require('http');
var path = require('path');
var log = console.log;

var childProcess = require('child_process');
var slimerjs = require('slimerjs');

// console.log(slimerjs.path);
// console.log(process.cwd());

// to run slimmer or not
// if (false) {
if (true) {
	// for debug
	// childProcess.exec( slimerjs.path + ' ' + path.join(process.cwd(), 'headless.js'), function(err, stdout, stderr){
	// for production
	childProcess.exec( 'xvfb-run --server-args="-screen 0, 1366x1024x24" --auto-servernum --server-num=1 ' + slimerjs.path + ' ' + path.join(process.cwd(), 'headless.js'), function(err, stdout, stderr){
		if (err) {
			console.log('error with SlimmerJS startup', err.stack ||  err);
		} else {
			console.log('SlimmerJS started...');
		}
	});
}

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