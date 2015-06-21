require('harmonize')();
var gulp = require('gulp');
var jest = require('gulp-jest');
 
gulp.task('jest', function () {
    return gulp.src('__tests__').pipe(jest({
        scriptPreprocessor: "./utils/preprocessor.js",
        unmockedModulePathPatterns: [
            "node_modules/react"
        ],
        testDirectoryName: "__tests__",
        "testFileExtensions": [
          "coffee",
          "js",
          "cjsx"
        ]
    }));
});

gulp.task('watch', function() {
    gulp.watch(['./__tests__/**/*.coffee'], ['jest']);
    gulp.watch(['./app/components/**/*.coffee'], ['jest']);
    gulp.watch(['./app/components/**/*.cjsx'], ['jest']);
});

gulp.task('default', ['jest', 'watch']);

