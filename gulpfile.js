const gulp = require('gulp');
const del = require('del');
const $ = require('gulp-load-plugins')();

gulp.task('clean', function () {
  return del('dist/**/*');
});

// gulp.task('bundle-listener', function() {
//   // Single entry point to browserify
//   gulp.src('public/listen.js')

//     .pipe($.rename('listen.bundle.js'))
//     .pipe($.uglify())
//     .pipe(gulp.dest('dist/js'));
// });

// gulp.task('bundle-streamer', function() {
//   // Single entry point to browserify
//   gulp.src('public/listen.js')
//     .pipe($.browserify({
//       insertGlobals : true
//     }))
//     .pipe($.rename('stream.bundle.js'))
//     .pipe($.uglify())
//     .pipe(gulp.dest('dist/js'));
// });

gulp.task('html-listen', function () {
  return gulp.src('public/listen.html')
    .pipe($.useref({ searchPath: ['./', 'public'] }))
    .pipe($.if('*.js', $.babel({
      presets: ['es2015']
    })))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe(gulp.dest('dist'));
});

gulp.task('html-stream', function () {
  return gulp.src('public/stream.html')
    .pipe($.useref({ searchPath: ['./', 'public'] }))
    .pipe($.if('*.js', $.babel({
      presets: ['es2015']
    })))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe(gulp.dest('dist'));
});

gulp.task('html-index', function () {
  return gulp.src('public/index.html')
    .pipe($.useref({ searchPath: ['./', 'public'] }))
    .pipe($.if('*.js', $.babel({
      presets: ['es2015']
    })))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', function() {
  // font-awesome
  return gulp.src(['public/lib/font-awesome/fonts/*'])
    .pipe(gulp.dest('dist/fonts'));
});

//------------------------------

gulp.task('build', $.sequence('clean', ['html-listen', 'html-stream', 'html-index', 'copy']))
