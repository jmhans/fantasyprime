module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['app/min-safe/js/*.js'],
                dest: 'app/dist/<%= pkg.name %>.js'
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            app1: {
                files: [
                    {
                        'app/min-safe/js/controllers.js': ['app/js/controllers.js'],
                        'app/min-safe/js/directives.js': ['app/js/directives.js'],
                        'app/min-safe/js/filters.js': ['app/js/filters.js'],
                        'app/min-safe/js/services.js': ['app/js/services.js'],
                        'app/min-safe/js/app.js': ['app/js/app.js'],
                    },
                ],
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                files: {
                    'app/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'app/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');



    // Default task(s).
    grunt.registerTask('default', [ 'concat', 'uglify']);

};