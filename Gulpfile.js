var gulp        = require("gulp");
var uglify      = require("gulp-uglify");
var concat      = require("gulp-concat");
var streamqueue = require('streamqueue');
var minifyCSS   = require("gulp-minify-css");

gulp.task("js", function () {

    var stream = streamqueue({ objectMode: true });

    stream.queue(
        gulp.src([
            "public/js/vendor/*.min.js"
        ])
    );

    stream.queue(
        gulp.src([
            "public/js/vendor/*.js",
            "!public/js/vendor/*.min.js",
            "public/js/script.js"
        ])
        .pipe(uglify({preserveComments: "some"}))
    );

    return stream.done()
        .pipe(concat("scripts.js"))
        .pipe(gulp.dest("public/build/"));

});

gulp.task("css", function () {

    var stream = streamqueue({ objectMode: true });

    stream.queue(
        gulp.src("public/css/*.css")
    );

    return stream.done()
        .pipe(concat("style.css"))
        .pipe(minifyCSS())
        .pipe(gulp.dest("public/build/"));

});

gulp.task('default', ['js', 'css']);