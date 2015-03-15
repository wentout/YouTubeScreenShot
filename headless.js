'use strict';
try {

	var alpabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	var randStr = function (len) {
		!len && (len = 8);
		var str = '';
		for (var i = 0; i < len; i++) {
			str += alpabet[(Math.floor(Math.random() * 62))];
		}
		return str;
	};

	var makeScreenshot = function(time, callback) {
		
		var playerController = null;
		
		var page = require('webpage').create();
		
		var viewportSize = { width: 1280, height: 750 };
		page.onError = function (message, stack) {
			console.log(message, stack);
		};
		
		// var url = 'https://www.youtube.com/embed/GNZBSZD16cY?autoplay=1&t=10';
		var url = 'https://www.youtube.com/embed/GNZBSZD16cY';
		
		page.viewportSize = viewportSize;
		
		var captureYT = function(cb) {
			setTimeout(function () {
				
				playerController = page.evaluate(function () {
					var player = yt.player.getPlayerByElement('player');
					return player;
				});
				
				if (playerController.playVideo) {
					cb();
				} else {
					captureYT(cb);
				}
				
			}, 100);
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
		var checkTime = function() {
			var ct = playerController.getCurrentTime();
			if (ct > 0 && ct >= time + 2) {
				makeCapture();
			} else {
				setTimeout(checkTime, 10);
			}
		};
		var startCapture = function() {
			playerController.seekTo(time);
			// playerController.playVideo();
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
		page.open(url);
		
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
		var split = str.split(/\//g);
		if (split.length == 3 && split[1] == 's') {
			var time = parseFloat(split[2]) - 2;
			if (time < 0) {
				time = 0;
			}
			console.log('time: ' + time, split[2]);
			makeScreenshot(time, function(fileName){
				makeResponse(res, fileName);
			});
		} else {
			makeResponse(res);
		}
	});

} catch (err) {
	
	console.log( err.stack || err );
	phantom.exit();
	
}