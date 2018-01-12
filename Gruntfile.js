module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'client/css/production/production.css': ['client/css/*.css']
        }
      }
    },
    
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['client/js/master.js'],
        dest: 'client/js/production/production.js'
      }
    },
    
    uglify: {
      options: {
        mangle: false
      },
      
      my_target: {
        files: {
          'client/js/production/production.min.js': 'client/js/production/production.js'
        }
      }
    },
      
    sass: {                              // Task
        dist: {                            // Target
          options: {                       // Target options
            style: 'expanded'
          },
          files: {                         // Dictionary osf files
            'client/css/main.css': 'client/css/scss/*.scss'      // 'destination': 'source'
          }
        }
    },
    
    watch: {
      scripts: {
        files: ['client/js/master.js', 'client/css/scss/main.scss'],
        tasks: ['concat', 'uglify', 'sass', 'cssmin'],
        options: {
          interrupt: true
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};