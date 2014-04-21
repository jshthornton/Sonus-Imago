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
			},

			clean: {
				main: ['<%= pkg.dist %>/*'],
				after: [
					'<%= pkg.dist %>/scripts/*',
					'!<%= pkg.dist %>/scripts/app.js'
				]
			}

			copy: {
				main: {
					files: [
						{
							expand: true, 
							cwd: '<%= pkg.src %>/', 
							src: ['**'], 
							dest: '<%= pkg.dist %>/'
						} // includes files in path and its subdirs
					]
				},
			},

			requirejs: {
				compile: {
					options: {
						baseUrl: './',
						mainConfigFile: 'build.js',
						name: 'path/to/almond', // assumes a production build using almond
						out: 'path/to/optimized.js'
					}
				}
			}
		});

		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.loadNpmTasks('grunt-contrib-requirejs');
		grunt.loadNpmTasks('grunt-contrib-copy');

		//Task to run all jshints
		grunt.registerTask('jshint:all', ['jshint:grunt', 'jshint:src']);
	};
}());