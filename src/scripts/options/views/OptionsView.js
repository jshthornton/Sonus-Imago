define([
	'underscore',
	'Backbone',
	'text!./templates/Options.jst',
	'collections/options',
	'collections/moodPacks',
	'models/Option/GridSize'
], function(_, Backbone, template, options, moodPacks, GridSize) {
	'use strict';

	var V = Backbone.View.extend({
		//$volumeText
		//$volumeRange
		//$status

		initialize: function() {
			console.log(options)
			this.render();
		},

		render: function() {
			var compiled = _.template(template),
				output = compiled({
					options: options,
					moodPacks: moodPacks,
					sizes: GridSize.SIZES
				}),
				$tmpl = $(output);

			this.$volumeText = $('#volume', $tmpl);
			this.$volumeRange = $('#volume-range', $tmpl);

			this.$status = $('#status', $tmpl);

			$('main', this.$el).html($tmpl);
		},

		//Events
		events: {
			'change #grid-size': 'onGridSizeChange',
			'change .volume': 'onVolumeChange',
			'change #mood-pack': 'onMoodPackChange',
			'keydown #trigger-key': 'onTriggerKeyKeydown',
			'submit #options': 'onSubmit',
			'reset #options': 'onReset'
		},

		onGridSizeChange: function(e) {
			var select = e.currentTarget,
				value = select.selectedOptions[0].value,
				gridSize = options.get('gridSize');

			gridSize.set('value', value);

			this.$status.addClass('unsaved');
		},

		onVolumeChange: _.throttle(function(e) {
			var val = e.currentTarget.value;

			if(this.$volumeText[0] !== e.currentTarget) {
				this.$volumeText[0].value = val;
			} else if(this.$volumeRange[0] !== e.currentTarget) {
				this.$volumeRange[0].value = val;
			}

			options.get('volume').set('value', val);

			this.$status.addClass('unsaved');
		}, 200),

		onMoodPackChange: function() {

		},

		onTriggerKeyKeydown: _.debounce(function(e) {
			var triggerKey = options.get('triggerKey');

			triggerKey.set('keyCode', e.keyCode);
			triggerKey.set('ctrl', e.ctrlKey);
			triggerKey.set('shift', e.shiftKey);
			triggerKey.set('alt', e.altKey);

			e.currentTarget.value = triggerKey.getPrintable();

			this.$status.addClass('unsaved');
		}, 500),

		onSubmit: function(e) {
			e.preventDefault();

			options.saveAll();

			this.$status.removeClass('unsaved');
		},

		onReset: function(e) {
			e.preventDefault();

			options.resetInitial();

			this.render();

			this.$status.addClass('unsaved');
		}
	});

	return V;
});