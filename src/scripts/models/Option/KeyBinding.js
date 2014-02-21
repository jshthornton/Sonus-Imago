define([
	'../Option'
], function(Option) {
	var KeyBinding = Option.extend({
		defaults: function() {
			return {
				id: null,
				keyCode: null,
				shift: false,
				alt: false,
				ctrl: false
			}
		},

		getPrintable: function() {
			function concat(src, extra) {
				if(src.length) {
					src += ' + ';
				}
				src += extra;

				return src;
			}

			var str = '';

			if(this.get('ctrl')) {
				str = concat(str, KeyBinding.NON_PRINTABLE[17]);
			}

			if(this.get('shift')) {
				str = concat(str, KeyBinding.NON_PRINTABLE[16]);
			}

			if(this.get('alt')) {
				str = concat(str, KeyBinding.NON_PRINTABLE[18]);
			}

			var keyCode = this.get('keyCode');
			if(keyCode !== null && keyCode !== undefined) {
				var chr = '',
					non_print = KeyBinding.NON_PRINTABLE[keyCode];

				if(non_print) {
					chr = non_print;
				} else {
					chr = String.fromCharCode(keyCode).toLowerCase();
				}

				if(chr.length) {
					str = concat(str, chr);
				}
			}

			return str;
		}
	});

	KeyBinding.NON_PRINTABLE = {
	  8: 'backspace',
	  9: 'tab',
	  13: 'enter',
	  16: 'shift',
	  17: 'ctrl',
	  18: 'alt',
	  19: 'pause/break',
	  20: 'caps lock',
	  27: 'escape',
	  33: 'page up',
	  34: 'page down',
	  35: 'end',
	  36: 'home',
	  37: 'left arrow',
	  38: 'up arrow',
	  39: 'right arrow',
	  40: 'down arrow',
	  45: 'insert',
	  46: 'delete',
	  91: 'left window',
	  92: 'right window',
	  93: 'select key',
	  96: 'numpad 0',
	  97: 'numpad 1',
	  98: 'numpad 2',
	  99: 'numpad 3',
	  100: 'numpad 4',
	  101: 'numpad 5',
	  102: 'numpad 6',
	  103: 'numpad 7',
	  104: 'numpad 8',
	  105: 'numpad 9',
	  106: 'multiply',
	  107: 'add',
	  109: 'subtract',
	  110: 'decimal point',
	  111: 'divide',
	  112: 'F1',
	  113: 'F2',
	  114: 'F3',
	  115: 'F4',
	  116: 'F5',
	  117: 'F6',
	  118: 'F7',
	  119: 'F8',
	  120: 'F9',
	  121: 'F10',
	  122: 'F11',
	  123: 'F12',
	  144: 'num lock',
	  145: 'scroll lock',
	  186: ',',
	  187: '=',
	  188: ',',
	  189: '-',
	  190: '.',
	  191: '/',
	  192: '`',
	  219: '[',
	  220: '\\',
	  221: ']',
	  222: '\''
	};

	return KeyBinding;
});