define([
	'../Option'
], function(Option) {
	var GridSize = Option.extend({
		defaults: function() {
			return {
				id: 'gridSize',
				value: null
			}
		}
	});

	GridSize.SIZES = {
		'4x4': {label: '4x4', rows: 4, cols: 4}, 
		'5x5': {label: '5x5', rows: 5, cols: 5}, 
		'6x6': {label: '6x6', rows: 6, cols: 6}
	};

	return GridSize;
});