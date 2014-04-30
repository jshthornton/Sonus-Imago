define([
	'underscore',
	'Backbone',
	'text!./template/Options.jst',
	'model/option',
	'collection/moodPacks'
], function(_, Backbone, template, option, moodPacks) {
	'use strict';

	var V = Backbone.View.extend({
		//_$volumeText
		//_$volumeRange
		//_$status
		//_$columnText
		//_$columnRange
		//_$rowText
		//_$rowRange

		initialize: function() {
			console.log('Loaded Options:', option);
			console.log('Loaded Mood Packs:', moodPacks);

			option.on('change', function() {
				this._$status
					.removeClass('saved error')
					.addClass('unsaved');
			}, this);

			option.on('invalid', function(model, error) {
				this._$error.text(error);

				this._$status
					.removeClass('saved unsaved')
					.addClass('error');
			}, this);

			this.render();
		},

		render: function() {
			var compiled = _.template(template),
				output = compiled({
					option: option,
					moodPacks: moodPacks
				}),
				$tmpl = $(output);

			this._$volumeText = $('#volume', $tmpl);
			this._$volumeRange = $('#volume-range', $tmpl);

			this._$columnText = $('#grid-column', $tmpl);
			this._$columnRange = $('#grid-column-range', $tmpl);

			this._$rowText = $('#grid-row', $tmpl);
			this._$rowRange = $('#grid-row-range', $tmpl);

			this._$status = $('#status', $tmpl);
			this._$error = $('.error', this._$status);

			$('main', this._$el).html($tmpl);
		},

		//Events
		events: {
			'change .grid-input': '_onGridChange',
			'change .volume': '_onVolumeChange',
			'change #mood-pack': '_onMoodPackChange',
			'change .input-group-key-binding': '_onKeyBindingChange',
			'submit #options': '_onSubmit',
			'reset #options': '_onReset'
		},

		_onGridChange: _.throttle(function(e) {
			var input = e.currentTarget,
				val = input.valueAsNumber,
				which = (input.name === 'grid-column' || input.id === 'grid-column') ? 'col' : 'row',
				optionId = (which === 'col') ? 'gridColumn' : 'gridRow';

			if(which === 'col') {
				if(this._$columnText[0] !== e.currentTarget) {
					this._$columnText[0].value = val;
				} else if(this._$columnRange[0] !== e.currentTarget) {
					this._$columnRange[0].value = val;
				}
			} else {
				if(this._$rowText[0] !== e.currentTarget) {
					this._$rowText[0].value = val;
				} else if(this._$rowRange[0] !== e.currentTarget) {
					this._$rowRange[0].value = val;
				}
			}

			option.set(optionId, val);

		}, 100),

		_onVolumeChange: _.throttle(function(e) {
			var val = e.currentTarget.value;

			if(this._$volumeText[0] !== e.currentTarget) {
				this._$volumeText[0].value = val;
			} else if(this._$volumeRange[0] !== e.currentTarget) {
				this._$volumeRange[0].value = val;
			}

			option.set('volume', val);
		}, 100),

		_onMoodPackChange: function(e) {
			option.set('moodPack', e.target.value);
		},

		_onKeyBindingChange: function(e) {
			var node = e.target,
				name = node.name,
				nameDT = name.split('.'),
				key = nameDT[0],
				prop = nameDT[1],
				keyModel = option.get(key);

			if(prop === 'shift' || prop === 'ctrl' || prop === 'alt') {
				var checked = node.checked;
				
				keyModel.set(prop, checked);
			} else if(prop === 'keyCode') {
				var val = parseInt(node.value, 10);

				if(val === -1) {
					keyModel.set('keyCode', null);
				} else {
					keyModel.set('keyCode', val);
				}
			}
		},

		_onSubmit: function(e) {
			e.preventDefault();

			var _this = this;

			option.save(null, {
				success: function() {
					_this._$status
						.removeClass('unsaved error')
						.addClass('saved');

					console.log('Options Saved:', option);
				}
			});
		},

		_onReset: function(e) {
			e.preventDefault();
			//Needs implementation
			this.render();
		}
	});

	return V;
});