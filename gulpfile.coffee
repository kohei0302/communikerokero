gulp = require 'gulp'
gutil = require 'gulp-util'
browserSync = require 'browser-sync';
compass = require 'gulp-compass';
coffee = require 'gulp-coffee';
uglify = require 'gulp-uglify'
minify = require 'gulp-minify-css'
browserify = require 'browserify';
source = require 'vinyl-source-stream'


gulp.task 'browserSync', ->
    browserSync.init null,
        server:
            baseDir: 'htdocs'

gulp.task 'html', ->
    browserSync.reload;

gulp.task 'css', ->
    gulp.src('nodeapp/sass/**/*.scss')
        .pipe compass
            config_file: 'config.rb',
            css: 'htdocs/css/',
            sass: 'nodeapp/sass/',
            comments: false
        .pipe minify

gulp.task 'js', ->
    browserify
            entries: ['./nodeapp/coffee/main.coffee'],
            extensions: ['.coffee']
        .bundle()
        .pipe source 'main.js'
        .pipe gulp.dest 'htdocs/js/'

gulp.task 'bower', ->
    gulp.src(
            'bower_components/normalize-css/normalize.css'
        )
        .pipe minify()
        .pipe gulp.dest('htdocs/css/libs')

gulp.task 'watch', ['browserSync'], ->
    gulp.watch('htdocs/**/*.html', ['html'])
    gulp.watch('nodeapp/coffee/**/*.coffee', ['js'])
    gulp.watch('nodeapp/sass/**/*.scss', ['css'])

gulp.task 'deploy', ['css', 'js']
gulp.task 'default', ['bower', 'watch']
