'use strict';

var p = require('path');
var http = require('http');

var express = require('express');

var app = express();

// var cwd = process.cwd();
// console.log( cwd, __dirname );

app.use( function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

var options = {
	method: 'GET',
	port: 3082,
	hostname: 'localhost',
	// cause of a a bug
	agent: false
};

app.use( express.static( p.join( __dirname, 'static') ) );

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post( '/screenshot', function(req, res) {
	
	var time = req.body.time.slice(0,100);
	var id = req.body.id.slice(0,20);
	
	console.log(id, time);
	
	options.path = '/s/' + id + '/' + time;
	var request = http.request(options, function(response) {
		
		var body = '';
		var status = 0 + response.statusCode;
		
		response.setEncoding('utf8');
		
		response.on('data', function (chunk) {
			body += chunk.toString();
		});
		
		response.on('end', function() {
			if (status == 200) {
				var path = body.replace(/^\n\>/, '');
				console.log(path);
				res.send( path );
			} else {
				res.status(502).send('error');
			}
		});

	});
	
	request.on('error', function(err){
		res.status(502).send('error');
	});
	
	request.end();
	
});


module.exports = app;