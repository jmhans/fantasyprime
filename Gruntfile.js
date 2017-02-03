/// <binding BeforeBuild='default' />
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },

            lib: {
                src: [  'node_modules/jquery/dist/jquery.js',
                        'node_modules/datatables.net/js/jquery.dataTables.js',
                        'node_modules/angular/angular.js',
                        'node_modules/angular-ui-router/release/angular-ui-router.js',
                        'node_modules/angular-ui-router-menus/dist/angular-ui-router-menus.js',
                        'node_modules/angular-google-gapi/dist/angular-google-gapi.js',
                        'node_modules/angular-datatables/dist/angular-datatables.js',
                        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js', 
                        'main.js',
                        'services/*.js',
                        'components/**/*.js'
                        
                ],
                dest: 'lib/<%= pkg.name %>.js'
            }
        },
        concat_css: {
            options: {
                // Task-specific options go here. 
            },
            all: {
                src: ["node_modules/angular-datatables/dist/css/angular-datatables.css"],
                dest: "css/styles.css"
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
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
    grunt.loadNpmTasks('grunt-concat-css');


    // Default task(s).
    grunt.registerTask('default', [ 'concat', 'uglify', 'concat_css']);

};