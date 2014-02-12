define([
	'Backbone',
	'underscore',
	'./_Base'
], function(Backbone, _, MoodPack) {
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
				instruments[0].setVolume(50);

				instruments[0].note('crotchet', 'C6');
				instruments[1].rest('crotchet');
				instruments[2].rest('crotchet');
				instruments[3].rest('crotchet');
			}, 
			'170_170_170': [
				//Light Grey
				'crotchet|C6',
				'crotchet|E6',
				'crotchet|G6',
				'crotchet|C3'
			],
			'85_85_85': [
				//Dark Grey
				'crotchet|C5',
				'crotchet|G5',
				'crotchet|C3',
				'crotchet|Eb5'
			],
			'0_0_0': function(color) {
				var instruments = GB.instruments;
				//instruments[0].setVolume(2);

				instruments[0].note('crotchet', 'C2');
				instruments[1].note('crotchet', 'C3');
				instruments[2].rest('crotchet');
				instruments[3].rest('crotchet');
			}, //Black

			//Reds
			'255_170_170': [
				'crotchet|C6',
				'crotchet|E6',
				'crotchet|G6',
				'crotchet|rest'
			], //Red 1
			'255_85_85': [
				'crotchet|C5',
				'crotchet|E5',
				'crotchet|G5',
				'crotchet|rest'
			], //Red 1
			'255_0_0': [
				'crotchet|C4',
				'crotchet|E4',
				'crotchet|G4',
				'crotchet|rest'
			], //Red 1
			'170_0_0': [
				'crotchet|C3',
				'crotchet|E3',
				'crotchet|G3',
				'crotchet|rest'
			], //Red 1
			'85_0_0': [
				'crotchet|C2',
				'crotchet|E2',
				'crotchet|G2',
				'crotchet|rest'
			], //Red 1

			'170_113_113': [
				'crotchet|C4',
				'crotchet|D4',
				'crotchet|E4',
				'crotchet|G4'
			], //Red 2
			'170_56_56': [
				'crotchet|C3',
				'crotchet|D3',
				'crotchet|E3',
				'crotchet|G3'
			], //Red 2
			'85_28_28': [
				'crotchet|C2',
				'crotchet|D2',
				'crotchet|E2',
				'crotchet|G2'
			], //Red 2

			'85_56_56': [
				'crotchet|C2',
				'crotchet|D2',
				'crotchet|E2',
				'crotchet|Gb2'
			], //Red 3

			//Magentas
			'255_170_255': [
				'crotchet|C6',
				'crotchet|E6',
				'crotchet|G6',
				'crotchet|rest'
			], //Magenta 1
			'255_85_255': [
				'crotchet|C5',
				'crotchet|E5',
				'crotchet|G5',
				'crotchet|rest'
			], //Magenta 1
			'255_0_255': [
				'crotchet|C4',
				'crotchet|E4',
				'crotchet|G4',
				'crotchet|rest'
			], //Magenta 1
			'170_0_170': [
				'crotchet|C3',
				'crotchet|E3',
				'crotchet|G3',
				'crotchet|rest'
			], //Magenta 1
			'85_0_85': [
				'crotchet|C2',
				'crotchet|E2',
				'crotchet|G2',
				'crotchet|rest'
			], //Magenta 1

			'170_113_170': [
				'crotchet|C4',
				'crotchet|Eb4',
				'crotchet|G4',
				'crotchet|Bb4'
			], //Magenta 2
			'170_56_170': [
				'crotchet|C3',
				'crotchet|Eb3',
				'crotchet|G3',
				'crotchet|Bb3'
			], //Magenta 2
			'85_28_85': [
				'crotchet|C2',
				'crotchet|Eb2',
				'crotchet|G2',
				'crotchet|Bb2'
			], //Magenta 2

			'85_56_85': [
				'crotchet|C2',
				'crotchet|Eb2',
				'crotchet|Gb2',
				'crotchet|Bb2'
			], //Magenta 3

			//Blues
			'170_170_255': [
				'crotchet|C6',
				'crotchet|Eb6',
				'crotchet|G6',
				'crotchet|rest'
			], //Blue 1
			'85_85_255': [
				'crotchet|C5',
				'crotchet|Eb5',
				'crotchet|G5',
				'crotchet|rest'
			], //Blue 1
			'0_0_255': [
				'crotchet|C4',
				'crotchet|Eb4',
				'crotchet|G4',
				'crotchet|rest'
			], //Blue 1
			'0_0_170': [
				'crotchet|C3',
				'crotchet|Eb3',
				'crotchet|G3',
				'crotchet|rest'
			], //Blue 1
			'0_0_85': [
				'crotchet|C2',
				'crotchet|Eb2',
				'crotchet|G2',
				'crotchet|rest'
			], //Blue 1

			'113_113_170': [
				'crotchet|C4',
				'crotchet|Eb4',
				'crotchet|Gb4',
				'crotchet|rest'
			], //Blue 2
			'56_56_170': [
				'crotchet|C3',
				'crotchet|Eb3',
				'crotchet|Gb3',
				'crotchet|rest'
			], //Blue 2
			'28_28_85': [
				'crotchet|C2',
				'crotchet|Eb2',
				'crotchet|Gb2',
				'crotchet|rest'
			], //Blue 2

			'56_56_85': [
				'crotchet|C2',
				'crotchet|Eb2',
				'crotchet|G2',
				'crotchet|A2'
			], //Blue 3

			//Cyans
			'170_255_255': [
				'crotchet|G5',
				'crotchet|B5',
				'crotchet|D6',
				'crotchet|F6'
			], //Cyan 1
			'85_255_255': [
				'crotchet|G4',
				'crotchet|B4',
				'crotchet|D5',
				'crotchet|F5'
			], //Cyan 1
			'0_255_255': [
				'crotchet|G3',
				'crotchet|B3',
				'crotchet|D4',
				'crotchet|F4'
			], //Cyan 1
			'0_170_170': [
				'crotchet|G2',
				'crotchet|B2',
				'crotchet|D3',
				'crotchet|F3'
			], //Cyan 1
			'0_85_85': [
				'crotchet|G1',
				'crotchet|B1',
				'crotchet|D2',
				'crotchet|F2'
			], //Cyan 1

			'113_170_170': [
				'crotchet|G3',
				'crotchet|Bb3',
				'crotchet|D4',
				'crotchet|F4'
			], //Cyan 2
			'56_170_170': [
				'crotchet|G2',
				'crotchet|Bb2',
				'crotchet|D3',
				'crotchet|F3'
			], //Cyan 2
			'28_85_85': [
				'crotchet|G1',
				'crotchet|Bb1',
				'crotchet|D2',
				'crotchet|F2'
			], //Cyan 2

			'56_85_85': [
				'crotchet|G1',
				'crotchet|Bb1',
				'crotchet|Db2',
				'crotchet|F2'
			], //Cyan 3

			//Greens
			'170_255_170': [
				'crotchet|C6',
				'crotchet|E6',
				'crotchet|G6',
				'crotchet|A6'
			], //Green 1
			'85_255_85': [
				'crotchet|C5',
				'crotchet|E5',
				'crotchet|G5',
				'crotchet|A5'
			], //Green 1
			'0_255_0': [
				'crotchet|C4',
				'crotchet|E4',
				'crotchet|G4',
				'crotchet|A4'
			], //Green 1
			'0_170_0': [
				'crotchet|C3',
				'crotchet|E3',
				'crotchet|G3',
				'crotchet|A3'
			], //Green 1
			'0_85_0': [
				'crotchet|C2',
				'crotchet|E2',
				'crotchet|G2',
				'crotchet|A2'
			], //Green 1

			'113_170_113': [
				'crotchet|C4',
				'crotchet|E4',
				'crotchet|Gb4',
				'crotchet|A4'
			], //Green 2
			'56_170_56': [
				'crotchet|C3',
				'crotchet|E3',
				'crotchet|Gb3',
				'crotchet|A3'
			], //Green 2
			'28_85_28': [
				'crotchet|C2',
				'crotchet|E2',
				'crotchet|Gb2',
				'crotchet|A2'
			], //Green 2

			'56_85_56': [
				'crotchet|C2',
				'crotchet|Eb2',
				'crotchet|Gb2',
				'crotchet|A2'
			], //Green 3

			//Yellows
			'255_255_170': [
				'crotchet|F6',
				'crotchet|A6',
				'crotchet|G6',
				'crotchet|Bb6'
			], //Yellow 1
			'255_255_85': [
				'crotchet|F5',
				'crotchet|A5',
				'crotchet|C6',
				'crotchet|Eb6'
			], //Yellow 1
			'255_255_0': [
				'crotchet|F4',
				'crotchet|A4',
				'crotchet|C5',
				'crotchet|Eb5'
			], //Yellow 1
			'170_170_0': [
				'crotchet|F3',
				'crotchet|A3',
				'crotchet|C4',
				'crotchet|Eb4'
			], //Yellow 1
			'85_85_0': [
				'crotchet|F2',
				'crotchet|A2',
				'crotchet|C3',
				'crotchet|Eb3'
			], //Yellow 1

			'170_170_113': [
				'crotchet|F4',
				'crotchet|A4',
				'crotchet|B4',
				'crotchet|rest'
			], //Yellow 2
			'170_170_56': [
				'crotchet|F3',
				'crotchet|A3',
				'crotchet|B3',
				'crotchet|rest'
			], //Yellow 2
			'85_85_28': [
				'crotchet|F2',
				'crotchet|A2',
				'crotchet|B2',
				'crotchet|rest'
			], //Yellow 2

			'85_85_56': [
				'crotchet|F2',
				'crotchet|A2',
				'crotchet|B2',
				'crotchet|Eb3'
			] //Yellow 3
		},

		_createInstruments: function() {
			var music = GB.music,
				instruments = GB.instruments;

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
			//return;
			var instruments = GB.instruments;

			instruments[0].setVolume(50);
			instruments[1].setVolume(50);
			instruments[2].setVolume(50);
			instruments[3].setVolume(50);

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
					if(notes[i] === undefined) continue;

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

	return GB;
});