$(function(){
	
	var playerControl, playerReady, $playerbox = $('#playerbox');
	window.onPlayerReady = function (ev) {
		playerReady = ev.target;
		// playerReady.playVideo();
		window.embedYTplayerReadyController = playerReady;
	};
	window.onYouTubeIframeAPIReady = function () {
		$playerbox.empty().append($('<div>').attr('id','player'));
		var vid = window.location.hash.replace('#', '');
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
	};
	$.getScript('https://www.youtube.com/iframe_api');
	
});
