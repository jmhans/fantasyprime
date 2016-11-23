/// <binding BeforeBuild='default' />
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [  'app/bower_components/angular/angular.js',
                        'app/bower_components/angular-route/angular-route.js',
                        'app/js/*.js'],
                dest: 'app/dist/<%= pkg.name %>.js'
            },
            lib: {
                src: [  'bower_components/angular/angular.js',
                        'bower_components/angular-ui-router/release/angular-ui-router.js',
                        'bower_components/angular-ui-router-menus/dist/angular-ui-router-menus.js',
                        'bower_components/angular-google-gapi/dist/angular-google-gapi.js',
                        'main.js',
                        'services/*.js',
                        'components/**/*.js'
                        
                ],
                dest: 'lib/<%= pkg.name %>.js'
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
            },
            lib: {
                files: {
                    'lib/<%= pkg.name %>.min.js': ['<%= concat.lib.dest %>']
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