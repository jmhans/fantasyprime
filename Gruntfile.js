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
                src: ['app/node_modules/angular/angular.js',
                        'app/node_modules/angular-route/angular-route.js',
                        'app/js/*.js'],
                dest: 'app/dist/<%= pkg.name %>.js'
            },
            lib: {
                src: [  'node_modules/jquery/dist/jquery.js',
                        'node_modules/datatables/media/js/jquery.dataTables.js',
                        'node_modules/angular/angular.js',
                        'node_modules/angular-ui-router/release/angular-ui-router.js',
                        'node_modules/angular-ui-router-menus/dist/angular-ui-router-menus.js',
                        'node_modules/angular-google-gapi/dist/angular-google-gapi.js',
                        'node_modules/angular-datatables/dist/angular-datatables.js',
                        'node_modules/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.js',
                        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
                        'node_modules/angular-ui-sortable/dist/sortable.js',
                        'node_modules/ng-sortable/dist/ng-sortable.js',
                        'node_modules/angular-ui-tree/dist/angular-ui-tree.js',
                        'node_modules/angular-google-chart/ng-google-chart.js',
                        'node_modules/papaparse/papaparse.js',
                        'main.js',                        
                        'components/**/*.js',
                        'services/*.js'

                        
                ],
                dest: 'lib/<%= pkg.name %>.js'
            }
        },
        concat_css: {
            options: {
                // Task-specific options go here. 
            },
            all: {
                src: [
                    "node_modules/angular-datatables/dist/css/angular-datatables.css",
                    "node_modules/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css",
                    "node_modules/ng-sortable/dist/ng-sortable.style.min.css",
                    "node_modules/angular-ui-tree/dist/angular-ui-tree.css"
                    /*"node_modules/jquery-ui/themes/base/jquery-ui.css"*/
                ],
                dest: "css/styles.css"
            },
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
        },
        'ftp-deploy': {
            x10: {
                auth: {
                    host: 'ftp.actuarialgames.x10host.com',
                    port: 21,
                    authKey: 'site3'
                },
                src: 'webapp/',
                dest: ''
            }
        },
        copy: {
            main: {
                files: [
                  // includes files within path
                  { expand: true, src: ['lib/*',  'css/*', 'index.html', 'main.js', 'components/**/*.htm*', 'server/*'], dest: 'webapp/' }

                ],
            },
            data: {
                files: [
                  // includes files within path
                  { expand: true, src: ['data/*'], dest: 'webapp/' }

                ],
            },
        },
    });

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-ftp-deploy');


    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'concat_css']);
    grunt.registerTask('pkg_and_deploy', ['default', 'copy', 'ftp-deploy']);
    grunt.registerTask('deploy_data', [ 'copy:data', 'ftp-deploy']);
};












