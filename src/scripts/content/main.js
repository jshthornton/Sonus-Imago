require([
	'jquery'
], function($) {
	'use strict';

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if(!sender.tab) {
				switch (request.cmd) {
					case 'makeImage':
						var segments = JSON.parse(request.segments);
						console.log(segments);

						var $container = $('<div id="_ProjectHarmonyContainer"></div>')
							.css({
								'position': 'fixed',
								'top': 0,
								'right': 0,
								'border': '2px solid #323232'
							})
							.width(50 * request.numCols);

						for(var i = 0, len = segments.length; i < len; i++) {
							var segment = segments[i],
								alpha = segment.a / 255;

							alpha = parseFloat(alpha).toFixed(2);

							var $segment = $('<div></div>')
								.css({
									'background-color': 'rgba(' + segment.r + ',' + segment.g + ',' + segment.b + ',' + alpha + ')',
									'float': 'left'
								})
								.width(50)
								.height(50);

							$container.append($segment);
						}

						$('#_ProjectHarmonyContainer').remove();

						$(document.body).prepend($container);
						break;
				};
			}
		}
	);

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
			console.log('Active Element:');
			console.dir($active[0]);

			if(!$active.length) return;
			
			//Is img?
			if($active[0].nodeName !== 'IMG') return;

			$img = $active;
			$active = null;

			chrome.runtime.sendMessage({
				type: 'getImageData',
				imageSrc: $img.prop('src')
			}, function(resp) {
				console.dir(resp);
			});

		});
	});

});