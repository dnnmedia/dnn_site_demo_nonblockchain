var gulp = require('gulp');
var minify = require("gulp-minify");
var minifyCSS = require("gulp-minify-css");
var concat = require("gulp-concat");
var count = require("gulp-count");
var uglify = require("gulp-uglify");
var sass = require("gulp-sass");
var nodemon = require("gulp-nodemon");

// List of files/directories to minify (ORDER MATTERS)
var JSFILES = [
    "public/assets/js/libraries/angular/angular.min.js",
    "public/assets/js/libraries/angular/angular-route.min.js",
    "public/assets/js/libraries/**/*.js",
    "public/assets/js/modules/**/*.js",
    "public/assets/js/ui/*.js",
    "public/assets/js/application/*.js",
];

var SASSFILES = [
    "sass/*.scss"
];

gulp.task('merge-js-production', function() {

    // Perform task
    return gulp.src(JSFILES)
      .pipe(count())
      .pipe(minify())
      .pipe(concat("app.min.js"))
      .pipe(uglify())
      .pipe(gulp.dest("public/build"));
});

gulp.task('merge-js-development', function() {

    // Perform task
    return gulp.src(JSFILES)
      .pipe(count())
      .pipe(concat("app.min.js"))
      .pipe(gulp.dest("public/build"));
});

gulp.task('merge-sass-development', function() {

    // Perform task
    return gulp.src(SASSFILES)
      .pipe(count())
      .pipe(sass())
      .pipe(concat("app.min.css"))
      .pipe(gulp.dest("public/build"));
});

gulp.task('merge-sass-production', function() {

    // Perform task
    return gulp.src(SASSFILES)
      .pipe(count())
      .pipe(sass())
      .pipe(concat("app.min.css"))
      .pipe(minifyCSS())
      .pipe(gulp.dest("public/build"));
});

gulp.task("merge-prod", ["merge-js-production", "merge-sass-production"])

gulp.task("merge-dev", ["merge-js-development", "merge-sass-development"])

gulp.task('watch-dev', function () {
    nodemon({
        script: 'server.js',
        ext: 'js html scss',
        ignore: "build/*",
        tasks: ["merge-dev"]
    })
})
