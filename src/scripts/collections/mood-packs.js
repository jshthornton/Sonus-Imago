define([
	'Backbone',
	'underscore',
	'models/MoodPack',
	'localstorage'
], function(Backbone, _, MoodPack) {
	var C = Backbone.Collection.extend({});

	var GB = MoodPack.extend({
		defaults: {
			id: 'gb',
			name: 'Great Britain',
		},

		_palete: {
			//Shades
			'255_255_255': function(color) {
				//White
				var instruments = GB.instruments;
				instruments.note1.setVolume(2);

				instruments[0].note('crotchet', 'C6');
				instruments[1].rest('crotchet');
				instruments[2].rest('crotchet');
				instruments[3].rest('crotchet');
			}, 
			'170_170_170': [], //Light Grey
			'85_85_85': [], //Dark Grey
			'0_0_0': [], //Black

			//Reds
			'255_170_170': [], //Red 1
			'255_85_85': [], //Red 1
			'255_0_0': [
				'crotchet|E5',
				'crotchet|E5',
				'crotchet|E5',
				'crotchet|rest',
			], //Red 1
			'170_0_0': [], //Red 1
			'85_0_0': [], //Red 1

			'170_113_113': [], //Red 2
			'170_56_56': [], //Red 2
			'85_28_28': [], //Red 2

			'85_56_56': [], //Red 3

			//Magentas
			'255_170_255': [], //Magenta 1
			'255_85_255': [], //Magenta 1
			'255_0_255': [], //Magenta 1
			'170_0_170': [], //Magenta 1
			'85_0_85': [], //Magenta 1

			'170_113_170': [], //Magenta 2
			'170_56_170': [], //Magenta 2
			'85_28_85': [], //Magenta 2

			'85_56_85': [], //Magenta 3

			//Blues
			'170_170_255': [], //Blue 1
			'85_85_255': [], //Blue 1
			'0_0_255': [], //Blue 1
			'0_0_170': [], //Blue 1
			'0_0_85': [], //Blue 1

			'113_113_170': [], //Blue 2
			'56_56_170': [], //Blue 2
			'28_28_85': [], //Blue 2

			'56_56_85': [], //Blue 3

			//Cyans
			'170_255_255': [], //Cyan 1
			'85_255_255': [], //Cyan 1
			'0_255_255': [], //Cyan 1
			'0_170_170': [], //Cyan 1
			'0_85_85': [], //Cyan 1

			'113_170_170': [], //Cyan 2
			'56_170_170': [], //Cyan 2
			'28_85_85': [], //Cyan 2

			'56_85_85': [], //Cyan 3

			//Greens
			'170_255_170': [], //Green 1
			'85_255_85': [], //Green 1
			'0_255_0': [], //Green 1
			'0_170_0': [], //Green 1
			'0_85_0': [], //Green 1

			'113_170_113': [], //Green 2
			'56_170_56': [], //Green 2
			'28_85_28': [], //Green 2

			'56_85_56': [], //Green 3

			//Yellows
			'255_255_170': [], //Yellow 1
			'255_255_85': [], //Yellow 1
			'255_255_0': [], //Yellow 1
			'170_170_0': [], //Yellow 1
			'85_85_0': [], //Yellow 1

			'170_170_113': [], //Yellow 2
			'170_170_56': [], //Yellow 2
			'85_85_28': [], //Yellow 2

			'85_85_56': [] //Yellow 3
		},

		_createInstruments: function() {
			var music = GB.music,
				instruments = GB.instruments;

			instruments[0] = music.createInstrument();
			instruments[1] = music.createInstrument();
			instruments[2] = music.createInstrument();
			instruments[3] = music.createInstrument();

			instruments[0].rest('semiquaver');
			instruments[1].rest('semiquaver');
			instruments[2].rest('semiquaver');
			instruments[3].rest('semiquaver');
		},

		_generateNotes: function(color) {
			//return;
			var instruments = GB.instruments;

			instruments[0].setVolume(100);
			instruments[1].setVolume(100);
			instruments[2].setVolume(100);
			instruments[3].setVolume(100);

/*			//White
			if(color.r === 255 && color.g === 255 && color.b === 255) {
				//instruments.note1.setVolume(2);
				instruments.note1.note('crotchet', 'C6');
				instruments.note2.rest('crotchet');
				instruments.note3.rest('crotchet');
				instruments.note4.rest('crotchet');
				return;
			}

			//Light Grey
			if(color.r === 170 && color.g === 170 && color.b === 170) {
				//instruments.note1.setVolume(2);
				instruments.note1.note('crotchet', 'C6');
				instruments.note2.note('crotchet', 'E6');
				instruments.note3.note('crotchet', 'G6');
				instruments.note4.note('crotchet', 'C3');
				return;
			}

			//Dark Grey
			if(color.r === 85 && color.g === 85 && color.b === 85) {
				//instruments.note1.setVolume(2);
				instruments.note1.note('crotchet', 'C5');
				instruments.note2.note('crotchet', 'G5');
				instruments.note3.note('crotchet', 'C3');
				instruments.note4.note('crotchet', 'Eb5');
				return;
			}

			//Black
			if(color.r === 0 && color.g === 0 && color.b === 0) {
				//instruments.note1.setVolume(2);
				instruments.note1.note('crotchet', 'C2');
				instruments.note2.rest('crotchet');
				instruments.note3.rest('crotchet');
				instruments.note4.rest('crotchet');
				return;
			}*/

			//instruments.note1.note('crotchet', 'C4');

			function getPaleteString(color, delim) {
				delim = delim || ',';
				return '' + color.r + delim + color.g + delim + color.b;
			}

			var notes = this._palete[getPaleteString(color, '_')];

			if(notes === undefined) {
				throw new Error('Colour not found: ' + getPaleteString(color, ','));
			}

			if(typeof notes === 'function') {
				notes(color);
			} else {
				for(var i = 0; i < instruments.length; i++) {
					var parts = notes[i].split('|');

					if(parts[1] === 'rest') {
						instruments[i].rest(parts[0]);
					} else {
						instruments[i].note(parts[0], parts[1]);
					}
				}
			}

			//console.log(notes);

			//console.log(getPaleteString(color));
		}
	});

	var c = new C([new GB], {});

	return c;
});