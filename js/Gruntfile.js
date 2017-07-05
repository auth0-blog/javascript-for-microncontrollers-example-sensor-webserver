module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                presets: ['es2015-without-strict']
            },
            dist: {
                files: {
                    'dist/sensors.js': 'sensors.js'
                }
            }
        },
        uglify: {
            options: {
                mangle: {
                    reserved: ['photon', 'dht11']
                },
                compress: true,
                toplevel: true
            },
            build: {
                src: 'dist/sensors.js',
                dest: 'dist/sensors.js'
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['babel', 'uglify']);
};
