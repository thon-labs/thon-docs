const gulp = require('gulp');
const gulpUglify = require('gulp-uglify');
const gulpSass = require('gulp-sass')(require('sass'));

function scssToCss() {
  return gulp
    .src('./**/*.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(gulp.dest((file) => file.base));
}

function uglify() {
  return gulp.src('dist/**/*.js').pipe(gulpUglify()).pipe(gulp.dest('dist/'));
}

exports.postBuild = gulp.series(scssToCss, uglify);
