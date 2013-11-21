require([
	'jquery'
], function($) {
	'use strict';

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