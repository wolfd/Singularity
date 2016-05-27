var gulp = require('gulp');

var cjsx = require('gulp-cjsx');

gulp.task('cjsx', function () {
  gulp.src(['src/**/*.coffee', 'src/**/*.cjsx'])
    .pipe(cjsx({bare: true}))
    .pipe(gulp.dest('./lib'));
})
