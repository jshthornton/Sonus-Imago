require([
	'jquery',
	'underscore',
	'content/views/FlashMessageView'
], function($, _, FlashMessageView) {
	'use strict';

	_.templateSettings.variable = 'it';

	var main = {
		init: function() {
			_.bindAll(this);

			chrome.runtime.onMessage.addListener(this.onMessage);

			var optionPromise = this.fetchOption(),
				domReadyPromise = this.isDomReady();

			$.when(optionPromise, domReadyPromise).then(_.bind(function(option) {
				this.option = option;

				this.tabbableImage($('img', document.body));

				var observer = new WebKitMutationObserver(this.onMutation);

				observer.observe(document.body, {
					childList: true,
					subtree: true
				});

				$(document).on('keydown', _.debounce(this.onKeydown, 500));
			}, this));
		},

		tabbableImage: function($imgs) {
			$imgs.prop('tabIndex', 0);
		},

		isDomReady: _.once(function() {
			var def = new $.Deferred();

			$(document).ready(function() {
				def.resolve();
			});

			return def.promise();
		}),

		fetchOption: function() {
			var def = new $.Deferred();

			try {
				chrome.runtime.sendMessage({
					type: 'option'
				}, function(resp) {
					var option = JSON.parse(resp);

					console.log('Fetched Options: ', option);

					def.resolve(option);
				});
			} catch(e) {
				var flshMsg = new FlashMessageView({
					msg: 'Unable to fetch Sonus Imago options',
					type: 'error'
				});
				flshMsg = null;
			}
			
			return def.promise();
		},

		onKeydown: function(e) {
			var keyCode = e.keyCode,
				ctrlKey = e.ctrlKey,
				altKey = e.altKey,
				shiftKey = e.shiftKey,
				triggerKey = this.option.triggerKey,
				$active,
				img;

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

				img = $active[0];
				$active = null;

				try {
					chrome.runtime.sendMessage({
						type: 'harmonise',
						imageSrc: img.src
					}, function(resp) {
						//console.dir(resp);
					});
				} catch(ex) {
					var flshMsg = new FlashMessageView({
						msg: 'Unable to harmonise image, reason unknown',
						type: 'error'
					});
					flshMsg = null;
				}
			}
		},

		onMutation: function(mutations) {
			var insertedNodes = [];

			mutations.forEach(function(mutation) {
				for (var i = 0; i < mutation.addedNodes.length; i++) {
					var addedNode = mutation.addedNodes[i];
					if(addedNode.nodeName !== 'IMG') continue;

					insertedNodes.push(addedNode);
				}
			});

			this.tabbableImage($(insertedNodes));
		},

		onMessage: function(request, sender, sendResponse) {
			if(!sender.tab) {
				switch (request.cmd) {
					case 'flashMessage':
						var flshMsg = new FlashMessageView({
							msg: request.msg,
							type: request.type
						});
						flshMsg = null;
						break;
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
				}
			}
		}
	};

	main.init();
});