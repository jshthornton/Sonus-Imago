(function() {
	module.exports = function(grunt) {
		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),

			jshint: {
				grunt: ['Gruntfile.js'],
				src: [
					'<%= pkg.src %>/scripts/**/*.js',
					'!<%= pkg.src %>/scripts/libs/**/*.js',
					'!<%= pkg.src %>/scripts/require.js',
					'!<%= pkg.src %>/scripts/require-cs.js',
					'<%= pkg.src %>/scripts/libs/instruments/*.js'
				],
			}
		});

		grunt.loadNpmTasks('grunt-contrib-jshint');

		//Task to run all jshints
		grunt.registerTask('jshint:all', ['jshint:grunt', 'jshint:src']);
	};
}());