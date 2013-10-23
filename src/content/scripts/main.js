(function(win, undefined) {
	'use strict';

	var SHARED_PATH = '../../shared',
		SHARED_SCRIPTS_PATH = SHARED_PATH + '/scripts';

	require.config({
		baseUrl: chrome.extension.getURL('/content/scripts'),

		paths: {
			'jquery': SHARED_SCRIPTS_PATH + '/libs/jquery',
			'Class': SHARED_SCRIPTS_PATH + '/libs/Class',
			'_': SHARED_SCRIPTS_PATH + '/libs/lodash',
			'text': SHARED_SCRIPTS_PATH + '/libs/text'
		},

		shim: {
			Class: []
		}
	});

	require([
		'jquery'
	], function($) {
		function tabbableImage($imgs) {
			$imgs.prop('tabIndex', 0);
		};


		$(document).ready(function() {
			tabbableImage($('img'));

			var observer = new WebKitMutationObserver(function(mutations) {
				var insertedNodes = [];

				mutations.forEach(function(mutation) {
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						var addedNode = mutation.addedNodes[i];
						if(addedNode.nodeName !== 'IMG') continue;

						insertedNodes.push(addedNode);
					}
				});

				tabbableImage($(insertedNodes));
			});

			observer.observe(document.body, { childList: true });

			$(document).on('keyup', function(e) {
				var keyCode = e.keyCode,
					$active,
					$img;

				if(keyCode !== 120) return;

				$active = $(document.activeElement);
				console.log('Active Element: ');
				console.dir($active[0]);

				if(!$active.length) return;
				
				//Is img?
				if($active[0].nodeName !== 'IMG') return;

				$img = $active;
				$active = null;

				var imgWidth = $img.prop('width'),
					imgHeight = $img.prop('height');

				var $canvas = $('<canvas />'),
					canvas = $canvas[0],
					ctx;

				if(!canvas.getContext) return;

				ctx = canvas.getContext('2d');

				$(document.body).append($canvas); //Debug Code

				canvas.width = imgWidth;
				canvas.height = imgHeight;
				
				console.dir(canvas);

				ctx.drawImage($img[0], 0, 0);

				//$canvas.remove();

				$canvas = null;
				canvas = null;
			});
		});

	});
}(window));