define([
	'Backbone'
], function(Backbone) {
	'use strict';

	var C = Backbone.Collection.extend({
			saveAll: function() {
				var defs = [];
				
				this.localStorage._clear();

				this.each(function(chord, index) {
					chord.save();
				}, this);

				if(defs.length === 0) {
					defs.push(true);
				}

				return $.when.apply($, defs);
			}
		});

	return C;
});