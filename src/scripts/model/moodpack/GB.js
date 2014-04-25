define([
	'Backbone',
	'underscore',
	'./_Base',
	'lib/music'
], function(Backbone, _, MoodPack, music) {
	var GB = MoodPack.extend({
		defaults: {
			id: 'gb',
			name: 'Great Britain',
		},

		_palete: {
			//Shades
			'255_255_255': [
				//White
				'crotchet|C2|20',
				'crotchet|E5|50',
				'crotchet|G5|50',
				'crotchet|rest'
			], 
			'170_170_170': [
				//Light Grey
				'crotchet|C2|40',
				'crotchet|G2|40',
				'crotchet|Eb5',
				'crotchet|rest'
			],
			'85_85_85': [
				//Dark Grey
				'crotchet|C2|40',
				'crotchet|G2|40',
				'crotchet|Eb4|70',
				'crotchet|C5|70'
			],
			'0_0_0': [
				//Black
				'crotchet|C2|40',
				'crotchet|G2|40',
				'crotchet|rest',
				'crotchet|rest'
			],

			//------------------------------- Reds
			'255_170_170': [
				'crotchet|D2|25',
				'crotchet|A2|25',
				'crotchet|Gb5|70',
				'crotchet|rest'
			], //Red 1
			'255_85_85': [
				'crotchet|D2|35',
				'crotchet|A2|35',
				'crotchet|Gb5|90',
				'crotchet|A5|90'
			], //Red 1
			'255_0_0': [
				'crotchet|D2',
				'crotchet|A2',
				'crotchet|Gb4',
				'crotchet|D5'
			], //Red 1

			'170_113_113': [
				'crotchet|F2|40',
				'crotchet|A2|40',
				'crotchet|D4|50',
				'crotchet|rest'
			], //Red 2
			'170_56_56': [
				'crotchet|D2|40',
				'crotchet|A2|40',
				'crotchet|F4|50',
				'crotchet|A4|50'
			], //Red 2
			'170_0_0': [
				'crotchet|D2|50',
				'crotchet|F2|50',
				'crotchet|D4|70',
				'crotchet|D5|70'
			], //Red 2

			'85_56_56': [
				'crotchet|D2|40',
				'crotchet|A2|40',
				'crotchet|D4|50',
				'crotchet|F4|50'
			], //Red 3
			'85_28_28': [
				'crotchet|D2|40',
				'crotchet|A2|40',
				'crotchet|D5|50',
				'crotchet|F4|50'
			], //Red 2
			'85_0_0': [
				'crotchet|D2|40',
				'crotchet|F2|40',
				'crotchet|A2|40',
				'crotchet|rest'
			], //Red 3

			//------------------------------- Magentas
			'255_170_255': [
				'crotchet|Eb3|25',
				'crotchet|Bb2|25',
				'crotchet|G5|70',
				'crotchet|rest'
			], //Magenta 1
			'255_85_255': [
				'crotchet|Eb2|35',
				'crotchet|Bb2|35',
				'crotchet|G5|90',
				'crotchet|Bb5|90'
			], //Magenta 1
			'255_0_255': [
				'crotchet|Eb2',
				'crotchet|Bb2',
				'crotchet|G4',
				'crotchet|Eb5'
			], //Magenta 1

			'170_113_170': [
				'crotchet|Gb2|40',
				'crotchet|Bb2|40',
				'crotchet|Eb4|50',
				'crotchet|rest'
			], //Magenta 2
			'170_56_170': [
				'crotchet|Eb2|40',
				'crotchet|Bb2|40',
				'crotchet|Gb4|50',
				'crotchet|Bb4|50'
			], //Magenta 2
			'170_0_170': [
				'crotchet|Eb2|50',
				'crotchet|Gb2|50',
				'crotchet|Eb4|70',
				'crotchet|Eb5|70'
			], //Magenta 2

			'85_56_85': [
				'crotchet|Eb2|40',
				'crotchet|Bb2|40',
				'crotchet|Eb5|50',
				'crotchet|Gb5|50'
			], //Magenta 3
			'85_28_85': [
				'crotchet|Eb2|40',
				'crotchet|Bb2|40',
				'crotchet|Eb4|50',
				'crotchet|Gb4|50'
			], //Magenta 3
			'85_0_85': [
				'crotchet|Eb2|40',
				'crotchet|Gb2|40',
				'crotchet|Bb2|40',
				'crotchet|rest'
			], //Magenta 3

			//------------------------------- Blues
			'170_170_255': [
				'crotchet|B2|25',
				'crotchet|Gb3|25',
				'crotchet|D5|70',
				'crotchet|rest'
			], //Blue 1
			'85_85_255': [
				'crotchet|B2|35',
				'crotchet|Gb3|35',
				'crotchet|D5|90',
				'crotchet|Gb5|90'
			], //Blue 1
			'0_0_255': [
				'crotchet|B2',
				'crotchet|Gb3',
				'crotchet|D4',
				'crotchet|B4'
			], //Blue 1

			'113_113_170': [
				'crotchet|D2|40',
				'crotchet|Gb2|40',
				'crotchet|B4|50',
				'crotchet|rest'
			], //Blue 2
			'56_56_170': [
				'crotchet|B2|40',
				'crotchet|Gb2|40',
				'crotchet|D4|50',
				'crotchet|B3|50'
			], //Blue 2
			'0_0_170': [
				'crotchet|B2|50',
				'crotchet|D2|50',
				'crotchet|B4|70',
				'crotchet|B5|70'
			], //Blue 2

			'56_56_85': [
				'crotchet|B2|40',
				'crotchet|Gb2|40',
				'crotchet|B3|50',
				'crotchet|D4|50'
			], //Blue 3
			'28_28_85': [
				'crotchet|B2|40',
				'crotchet|Gb2|40',
				'crotchet|B4|50',
				'crotchet|D4|50'
			], //Blue 3
			'0_0_85': [
				'crotchet|B1|40',
				'crotchet|D2|40',
				'crotchet|Gb2|40',
				'crotchet|rest'
			], //Blue 3

			//------------------------------- Cyans
			'170_255_255': [
				'crotchet|E2|25',
				'crotchet|B2|25',
				'crotchet|Ab5|70',
				'crotchet|rest'
			], //Cyan 1
			'85_255_255': [
				'crotchet|E2|35',
				'crotchet|B2|35',
				'crotchet|Ab5|90',
				'crotchet|B5|90'
			], //Cyan 1
			'0_255_255': [
				'crotchet|E2',
				'crotchet|B2',
				'crotchet|Ab4',
				'crotchet|E5'
			], //Cyan 1

			'113_170_170': [
				'crotchet|G2|40',
				'crotchet|B2|40',
				'crotchet|E4|50',
				'crotchet|rest'
			], //Cyan 2
			'56_170_170': [
				'crotchet|E2|40',
				'crotchet|B2|40',
				'crotchet|G4|50',
				'crotchet|B4|50'
			], //Cyan 2
			'0_170_170': [
				'crotchet|E2|50',
				'crotchet|G2|50',
				'crotchet|E4|70',
				'crotchet|E5|70'
			], //Cyan 2

			'56_85_85': [
				'crotchet|E2|40',
				'crotchet|G2|40',
				'crotchet|E3|50',
				'crotchet|G3|50'
			], //Cyan 3
			'28_85_85': [
				'crotchet|E2|40',
				'crotchet|G2|40',
				'crotchet|E4|50',
				'crotchet|G3|50'
			], //Cyan 3
			'0_85_85': [
				'crotchet|E2|40',
				'crotchet|G2|40',
				'crotchet|B2|40',
				'crotchet|rest'
			], //Cyan 3

			//------------------------------- Greens
			'170_255_170': [
				'crotchet|G2|25',
				'crotchet|D3|25',
				'crotchet|B5|70',
				'crotchet|rest'
			], //Green 1
			'85_255_85': [
				'crotchet|G2|35',
				'crotchet|D3|35',
				'crotchet|B5|90',
				'crotchet|D5|90'
			], //Green 1
			'0_255_0': [
				'crotchet|G2',
				'crotchet|D3',
				'crotchet|B4',
				'crotchet|G5'
			], //Green 1

			'113_170_113': [
				'crotchet|Bb2|40',
				'crotchet|D3|40',
				'crotchet|G4|50',
				'crotchet|rest'
			], //Green 2
			'56_170_56': [
				'crotchet|G2|40',
				'crotchet|D3|40',
				'crotchet|Bb4|50',
				'crotchet|D5|50'
			], //Green 2
			'0_170_0': [
				'crotchet|G2|50',
				'crotchet|Bb2|50',
				'crotchet|G4|70',
				'crotchet|G5|70'
			], //Green 2

			'56_85_56': [
				'crotchet|G2|40',
				'crotchet|D3|40',
				'crotchet|G3|50',
				'crotchet|Bb3|50'
			], //Green 3
			'28_85_28': [
				'crotchet|G2|40',
				'crotchet|D3|40',
				'crotchet|G4|50',
				'crotchet|Bb3|50'
			], //Green 3
			'0_85_0': [
				'crotchet|G2|40',
				'crotchet|Bb2|40',
				'crotchet|D3|40',
				'crotchet|rest'
			], //Green 3

			//------------------------------- Yellows
			'255_255_170': [
				'crotchet|F2|25',
				'crotchet|C3|25',
				'crotchet|A5|70',
				'crotchet|rest'
			], //Yellow 1
			'255_255_85': [
				'crotchet|F2|35',
				'crotchet|C3|35',
				'crotchet|A5|90',
				'crotchet|C6|90'
			], //Yellow 1
			'255_255_0': [
				'crotchet|F2',
				'crotchet|C3',
				'crotchet|A4',
				'crotchet|F5'
			], //Yellow 1

			'170_170_113': [
				'crotchet|Ab2|40',
				'crotchet|C3|40',
				'crotchet|F4|50',
				'crotchet|rest'
			], //Yellow 2
			'170_170_56': [
				'crotchet|F2|40',
				'crotchet|C3|40',
				'crotchet|Ab4|50',
				'crotchet|C5|50'
			], //Yellow 2
			'170_170_0': [
				'crotchet|F2|50',
				'crotchet|Ab2|50',
				'crotchet|F4|70',
				'crotchet|F5|70'
			], //Yellow 2

			'85_85_56': [
				'crotchet|F2|40',
				'crotchet|C3|40',
				'crotchet|F3|50',
				'crotchet|Ab3|50'
			], //Yellow 3
			'85_85_28': [
				'crotchet|F2|40',
				'crotchet|C3|40',
				'crotchet|F4|50',
				'crotchet|Ab3|50'
			], //Yellow 3
			'85_85_0': [
				'crotchet|F2|40',
				'crotchet|Ab2|40',
				'crotchet|C3|40',
				'crotchet|rest'
			] //Yellow 3
		},

		_createInstruments: function() {
			var instruments = music.instruments;

			instruments[0] = music.createInstrument(undefined, 'piano');
			instruments[1] = music.createInstrument(undefined, 'piano');
			instruments[2] = music.createInstrument(undefined, 'piano');
			instruments[3] = music.createInstrument(undefined, 'piano');

			instruments[0].rest('semiquaver');
			instruments[1].rest('semiquaver');
			instruments[2].rest('semiquaver');
			instruments[3].rest('semiquaver');
		},

		_generateNotes: function(color) {
			var instruments = music.instruments;

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
					if(notes[i] === undefined) continue;

					var parts = notes[i].split('|');

					if(parts[1] === 'rest') {
						instruments[i].rest(parts[0]);
					} else {
						var volume = parts[2] || 100;

						instruments[i].setVolume(volume);
						instruments[i].note(parts[0], parts[1]);
					}
				}
			}
		}
	});

	return GB;
});