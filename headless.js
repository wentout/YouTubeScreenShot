'use strict';
try {

	// var url = 'https://www.youtube.com/embed/GNZBSZD16cY?autoplay=1&t=10';
	// var url = 'https://www.youtube.com/embed/GNZBSZD16cY';
	// var url = 'https://www.youtube.com/embed/';
	// var url = 'https://www.youtube.com/watch?v=';
	var url = 'http://localhost:3000/embed.html#';

	var alpabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randStr = function (len) {
		!len && (len = 8);
		var str = '';
		for (var i = 0; i < len; i++) {
			str += alpabet[(Math.floor(Math.random() * 62))];
		}
		return str;
	};

	var makeScreenshot = function(id, time, callback) {
		
		var playerController = null;
		
		var page = require('webpage').create();
		
		var viewportSize = { width: 1280, height: 750 };
		page.onError = function (message, stack) {
			console.log(message, stack);
		};
		
		page.viewportSize = viewportSize;
		
		var captureCount = 0;
		var captureYT = function(cb) {
			setTimeout(function () {
				
				captureCount++;
				playerController = page.evaluate(function () {
					// var player = yt.player.getPlayerByElement('player');
					var player = window.embedYTplayerReadyController;
					return player;
				});
				
				if (playerController.playVideo) {
					console.log('player is here: ' + captureCount);
					cb();
				} else {
					console.log('no player counting: ' + captureCount);
					captureYT(cb);
				}
				
			}, 1000);
		};
		
		var saveFileName = randStr(32) + '.png';
		var makeCapture = function() {
			playerController.pauseVideo();
			page.clipRect = { top: 0, left: 0, width: viewportSize.width, height: viewportSize.height };
			var fileName = 'static/screenshots/' + saveFileName;
			var fileURL = '/screenshots/' + saveFileName;
			page.render(fileName);
			page.close();
			callback(fileURL);
		};
		var checkTimeCount = 0;
		var checkTime = function() {
			checkTimeCount++;
			var ct = playerController.getCurrentTime();
			if (ct > 0 && ct >= time + 2) {
				makeCapture();
			} else {
				if (ct == 0) {
					if (checkTimeCount < 10) {
						playerController.playVideo();
						playerController.seekTo(time);
						setTimeout(checkTime, 1000);
					} else {
						console.log('no player movement in proper time');
						makeCapture();
					}
				} else {
					setTimeout(checkTime, 100);
				}
			}
		};
		var startCapture = function() {
			playerController.seekTo(time);
			setTimeout(function(){
				checkTime();
			}, 2000);
		};
		
		page.onLoadFinished = function (status) {
			if (status == "success") {
				captureYT( startCapture );
			} else {
				console.log("The loading has failed");
			}
		};
		// console.log(url + id);
		page.open(url + id);
		
	};
	
	var webserverTest = require("webserver").create();
	var makeResponse = function(res, str) {
		if (!str) {
			str = 'ok';
		}
		res.statusCode = 200;
		res.write('\n>' + str);
		res.close();
	};
	
	webserverTest.listen('127.0.0.1:3082', function (req, res) {
		var str = '' + req.url;
		console.log(str);
		var split = str.split(/\//g);
		if (split.length == 4 && split[1] == 's') {
			var time = parseFloat(split[3]) - 2;
			if (time < 0) {
				time = 0;
			}
			var id = split[2];
			// console.log('id: ' + id);
			// console.log('time: ' + time);
			makeScreenshot(id, time, function(fileName){
				makeResponse(res, fileName);
			});
		} else {
			makeResponse(res);
		}
	});
	
	console.log('Slimer confirms Start');

} catch (err) {
	
	console.log( err.stack || err );
	phantom.exit();
	
}
