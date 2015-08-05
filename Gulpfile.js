var gulp           = require('gulp');
var uglify         = require('gulp-uglify');
var concat         = require('gulp-concat');
var minifyCSS      = require('gulp-minify-css');
var bower          = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');
var order          = require('gulp-order');

gulp.task('js', function () {

    // Angular app
    var scripts = [
        'app/**/*.js'
    ]

    return gulp 
        .src(scripts)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/js/'))

});

gulp.task('vendor', ['bower'], function () {

    // Bower dependencies
    var bowerScripts = mainBowerFiles('**/*.js');

    return gulp 
        .src(bowerScripts)
        .pipe(order([
            '*angular.js',
            '*angular-sanitize.js'
        ]))
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js/'))

});

gulp.task('css', ['bower'], function () {

    // Bower dependencies
    var bowerStyles = mainBowerFiles('**/*.css');

    // App styles
    var styles = [
        'public/css/style.css'
    ]

    return gulp 
        .src(bowerStyles.concat(styles))
        .pipe(concat('styles.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/css/'))

});

gulp.task('bower', function() { 
    return bower();
});

gulp.task('watch', function() {
    gulp.watch('app/**/*.js', ['js']);
});

gulp.task('default', ['bower', 'vendor', 'js', 'css']);