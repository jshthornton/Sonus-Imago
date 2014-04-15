define([
	'underscore',
	'Backbone',
	'text!./templates/Options.jst',
	'collections/options',
	'collections/moodPacks',
	'debug'
], function(_, Backbone, template, options, moodPacks, debug) {
	'use strict';

	var V = Backbone.View.extend({
		//$volumeText
		//$volumeRange
		//$status
		//$columnText
		//$columnRange
		//$rowText
		//$rowRange

		initialize: function() {
			debug.log('Loaded Options:', options);
			this.render();
		},

		render: function() {
			var compiled = _.template(template),
				output = compiled({
					options: options,
					moodPacks: moodPacks
				}),
				$tmpl = $(output);

			this.$volumeText = $('#volume', $tmpl);
			this.$volumeRange = $('#volume-range', $tmpl);

			this.$columnText = $('#grid-column', $tmpl);
			this.$columnRange = $('#grid-column-range', $tmpl);

			this.$rowText = $('#grid-row', $tmpl);
			this.$rowRange = $('#grid-row-range', $tmpl);

			this.$status = $('#status', $tmpl);

			$('main', this.$el).html($tmpl);
		},

		//Events
		events: {
			'change .grid-input': 'onGridChange',
			'change .volume': 'onVolumeChange',
			'change #mood-pack': 'onMoodPackChange',
			'change .input-group-key-binding': 'onKeyBindingChange',
			'submit #options': 'onSubmit',
			'reset #options': 'onReset'
		},

		onGridChange: _.throttle(function(e) {
			var input = e.currentTarget,
				val = input.valueAsNumber,
				which = (input.name === 'grid-column' || input.id === 'grid-column') ? 'col' : 'row',
				optionId = (which === 'col') ? 'gridColumn' : 'gridRow',
				gridOption = options.get(optionId);

			if(which === 'col') {
				if(this.$columnText[0] !== e.currentTarget) {
					this.$columnText[0].value = val;
				} else if(this.$columnRange[0] !== e.currentTarget) {
					this.$columnRange[0].value = val;
				}
			} else {
				if(this.$rowText[0] !== e.currentTarget) {
					this.$rowText[0].value = val;
				} else if(this.$rowRange[0] !== e.currentTarget) {
					this.$rowRange[0].value = val;
				}
			}

			gridOption.set('value', val);

			this.$status
				.removeClass('saved')
				.addClass('unsaved');
		}, 100),

		onVolumeChange: _.throttle(function(e) {
			var val = e.currentTarget.value;

			if(this.$volumeText[0] !== e.currentTarget) {
				this.$volumeText[0].value = val;
			} else if(this.$volumeRange[0] !== e.currentTarget) {
				this.$volumeRange[0].value = val;
			}

			options.get('volume').set('value', val);

			this.$status
				.removeClass('saved')
				.addClass('unsaved');
		}, 100),

		onMoodPackChange: function() {

		},

		onKeyBindingChange: function(e) {
			var node = e.target,
				name = node.name,
				nameDT = name.split('.'),
				key = nameDT[0],
				prop = nameDT[1],
				option = options.get(key);

			if(prop === 'shift' || prop === 'ctrl' || prop === 'alt') {
				var checked = node.checked;
				
				option.set(prop, checked);
			} else if(prop === 'keyCode') {
				var val = parseInt(node.value, 10);

				if(val === -1) {
					option.set('keyCode', null);
				} else {
					option.set('keyCode', val);
				}
			}

			this.$status
				.removeClass('saved')
				.addClass('unsaved');
		},

		onSubmit: function(e) {
			e.preventDefault();

			options.saveAll();
			debug.log('Options Saved:', options);

			this.$status
				.removeClass('unsaved')
				.addClass('saved');
		},

		onReset: function(e) {
			e.preventDefault();

			options.resetInitial();

			this.render();

			this.$status
				.removeClass('saved')
				.addClass('unsaved');
		}
	});

	return V;
});