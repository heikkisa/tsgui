
var VERSION = "0.1";

module.exports = function(grunt) {
    "use strict";

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        typescript: {
            src: {
                src: ['src/**/*.ts'],
                dest: 'samples/tsgui.js',
                options: {
                    module: 'amd',
                    target: 'es3',
                    declaration: true
                }
            },
            demo: {
                src: ['samples/demo/*.ts'],
                dest: 'samples/demo.js',
                options: {
                    module: 'amd',
                    target: 'es3'
              }
            },
            home: {
                src: ['samples/home/*.ts'],
                dest: 'samples/home.js',
                options: {
                    module: 'amd',
                    target: 'es3'
                }
            }
        },
        
        watch: {
            src: {
                files: 'src/**/*.ts',
                tasks: ['typescript:src']
            },
            demo: {
                files: 'samples/demo/*.ts',
                tasks: ['typescript:demo']
            },
            home: {
                files: 'samples/home/*.ts',
                tasks: ['typescript:home']
            }
        },
        
        //Release build
        
        copy: {
            src: {
                files: [
                    {expand: true, flatten: true, src: ['samples/tsgui*'], dest: 'build/'},
                ]
            }
        },
        
        uglify: {
            options: {
                report: 'gzip'
            },
            src: {
                files: {
                    'build/tsgui.min.js': ['build/tsgui.js']
                }
            }
        },
        
        jsbeautifier: {
            files: ["samples/tsgui.js"],
            options: {
                js: {
                    braceStyle: "end-expand",
                }
            }
        }
    });

    grunt.registerTask('default', ['typescript']);
    grunt.registerTask('build', ['typescript:src', 'copy:src', 'uglify:src']);
    grunt.registerTask('beautify', ['jsbeautifier']);
};
