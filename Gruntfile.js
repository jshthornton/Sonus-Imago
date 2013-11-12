(function() {
	module.exports = function(grunt) {
		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),

			jshint: {
				grunt: ['Gruntfile.js'],
				content: ['<%= pkg.src %>/content/scripts/**/*.js']
			}
		});

		grunt.loadNpmTasks('grunt-contrib-jshint');

		//Task to run all jshints
		grunt.registerTask('jshint:all', ['jshint:grunt', 'jshint:content']);
	};
}());