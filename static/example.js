$(function(){
	
	var playerControl, playerReady, iFrame;
	
	var $urlbutton = $('#urlbutton');
	var $button = $('#startbutton');
	var $caption = $('#caption');
	var $tester = $('#tester');
	var $url = $('#url');
	var $playerbox = $('#playerbox');
	
	$url.attr('disabled', 'disabled').css('cursor','none');
	$urlbutton.attr('disabled', 'disabled').css('cursor','none');
	$button.attr('disabled', 'disabled').css('cursor','none');
	
	var getUrlVideoId = function() {
		var val = $url.val();
		if (/^[https|http]:\/\/[www.]*youtube.com\/watch\?v=[.]{0,11}/.test(val)) {
			return val.split('v=')[1].split('&')[0];
		} else {
			alert('No Video ID in given URL!');
			return null;
		}
	};
	var setUrlButtonBehaviour = function(type) {
		!type && (type = getUrlVideoId());
		if (type) {
			$urlbutton.removeAttr('disabled').css('cursor','pointer');
		} else {
			$urlbutton.attr('disabled', 'disabled').css('cursor','none');
		}
	};
	
	var catchVideo = function() {
		$playerbox.empty().append($('<div>').attr('id','player'));
		var vid = getUrlVideoId();
		if (vid) {
			playerControl = new YT.Player('player', {
				height: '750',
				width: '1280',
				videoId: vid,
				events: {
					'onReady': onPlayerReady
				}
			});
		}
		setUrlButtonBehaviour(vid);
	};
	
	window.onYouTubeIframeAPIReady = function () {
		catchVideo();
		setUrlButtonBehaviour();
		$url.removeAttr('disabled').css('cursor','text');
	};
	window.onPlayerReady = function (ev) {
		$button.removeAttr('disabled').css('cursor','pointer');
		playerReady = ev.target;
	};
	setTimeout(function(){
		$.getScript('https://www.youtube.com/iframe_api');
	}, 1000);
	
	$urlbutton.on('click', catchVideo);
	
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
		
		var id = getUrlVideoId();
		if (id) {
			
			var time = playerReady.getCurrentTime();
			var cTime = Math.floor( time );
			var strS = '' + ( cTime % 60 );
			cTime = Math.floor( cTime / 60 ) + ':' + ( strS.length > 1 ? strS : '0' + strS );
			showReqCaption( cTime );
			
			$.ajax({
				url: '/screenshot',
				type: 'POST',
				data: {
					time: time,
					id: id
				},
				success: function (path) {
					window.clearInterval(showReqCaptionInt);
					showReqCaptionInt = null;
					$caption.html( 'Server answered with: ' + path );
					$tester.attr( 'src', path );
				},
				error: function(err) {
					window.clearInterval(showReqCaptionInt);
					showReqCaptionInt = null;
					$caption.html( 'Server answered with an ERROR...' );
				}
			});
			
		}
		
	});
	
});
