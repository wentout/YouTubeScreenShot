$(function(){
	
	var playerControl, playerReady, iFrame;
	
	var $button = $('#start');
	var $caption = $('#caption');
	var $tester = $('#tester');
	
	window.onYouTubeIframeAPIReady = function () {
		playerControl = new YT.Player('player', {
			height: '750',
			width: '1280',
			videoId: 'GNZBSZD16cY',
			events: {
				'onReady': onPlayerReady
			}
		});
		window.playerControl = playerControl;
	};
	
	$.getScript('https://www.youtube.com/iframe_api');
	
	$button.attr('disabled', 'disabled').css('cursor','none');
	window.onPlayerReady = function (ev) {
		$button.removeAttr('disabled').css('cursor','pointer');
		playerReady = ev.target;
	};
	
	var showReqCaptionInt = null;
	var showReqCaptionCnt = 0;
	var showReqCaptionStr = 'queued screenshot at time [ zzz ] waiting server response';
	var showReqCaption = function (time) {
		if (!showReqCaptionInt) {
			showReqCaptionCnt = 0;
			$caption.html(showReqCaptionStr.replace('zzz', time) + ' ...');
			showReqCaptionInt = window.setInterval(function(){
				showReqCaption(time);
			}, 500);
		} else {
			showReqCaptionCnt++;
			if ( showReqCaptionCnt > 3 ) {
				showReqCaptionCnt = 0;
			} 
			$caption.html( showReqCaptionStr.replace('zzz', time) + ' ' + ( new Array(showReqCaptionCnt + 1).join('.') ) );
		}
	};
	
	$button.on('click', function(){
		
		var time = playerReady.getCurrentTime();
		
		var cTime = Math.floor( time );
		cTime = Math.floor( cTime / 60 ) + ':' + ( cTime % 60 );
		showReqCaption( cTime );
		
		$.get('/screenshot/' + time, function (path) {
			window.clearInterval(showReqCaptionInt);
			showReqCaptionInt = null;
			$caption.html( 'server answered with: ' + path );
			$tester.attr( 'src', path );
		});
		
	});
	
});
