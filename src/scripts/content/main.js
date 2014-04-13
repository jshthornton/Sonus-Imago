require([
	'jquery',
	'underscore'
], function($, _) {
	'use strict';

	chrome.runtime.sendMessage({
		type: 'options'
	}, function(resp) {
		var options = JSON.parse(resp);

		console.log(options);

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

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});

			$(document).on('keydown', _.debounce(function(e) {
				var keyCode = e.keyCode,
					ctrlKey = e.ctrlKey,
					altKey = e.altKey,
					shiftKey = e.shiftKey,
					triggerKey = options.triggerKey,
					$active,
					$img;

				if(
					keyCode == triggerKey.keyCode && 
					ctrlKey === triggerKey.ctrl && 
					altKey === triggerKey.alt && 
					shiftKey === triggerKey.shift
				) {
					$active = $(document.activeElement);

					if(!$active.length) return;
					
					//Is img?
					if($active[0].nodeName !== 'IMG') return;

					$img = $active;
					$active = null;

					chrome.runtime.sendMessage({
						type: 'harmonise',
						imageSrc: $img.prop('src')
					}, function(resp) {
						//console.dir(resp);
					});
				}
			}, 500));
		});
	});

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if(!sender.tab) {
				switch (request.cmd) {
					case 'makeImage':
						var segments = JSON.parse(request.segments);

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
});