'use strict';

var config = require('./config/config');

var del = require('del'),
    gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files'),
    templateCache = require('gulp-angular-templatecache'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    sass = require('gulp-sass'),
    sourcemap = require('gulp-sourcemaps'),
    nodemon = require('gulp-nodemon'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

var watchFiles = {
  allFiles: './**/*',

  devDir: '.tmp/public/',
  buildDir: 'build/public/',
  assetsDir: './assets/',
  appDir: 'assets/app/',
  jsDir: 'assets/js/',
  sassDir: 'assets/scss/',
  cssDir: 'assets/css/',
  imageDir: 'assets/img/',

  appOutputFile: 'app.js',
  dependenciesOutputFile: 'dependencies.js',
  viewOutputFile: 'views.js',
  
  ignoreApp: '!./**/app{,/**}',
  ignoreDependencies: '!./**/dependencies{,/**}',
  ignoreViews: '!./**/views{,/**}',
  ignoreSass: '!./**/scss{,/**}',
  ignoreMarkdown: '!*.md',

  viewFiles: 'assets/views/**/*.html',
  appFiles: 'assets/app/**/*.js',
  sassFiles: 'assets/scss/**/*.scss',
  imageFiles: 'assets/img/**',
  dependencyFiles: 'assets/dependencies/**'
};

gulp.task('clean', function (cb) {
  del([ watchFiles.devDir, watchFiles.buildDir ], cb);
});

gulp.task('bower-files', function () {
  return gulp.src(mainBowerFiles())
    .pipe(concat(watchFiles.dependenciesOutputFile))
    .pipe(gulp.dest(watchFiles.jsDir));
});

gulp.task('templates', function () {
  return gulp.src(watchFiles.viewFiles)
    .pipe(templateCache({ filename: watchFiles.viewOutputFile }))
    .pipe(gulp.dest(watchFiles.jsDir));
});

gulp.task('app', function () {
  return gulp.src(watchFiles.appFiles)
    .pipe(jshint())
    .pipe(ngAnnotate())
    .pipe(concat(watchFiles.appOutputFile))
    .pipe(gulp.dest(watchFiles.jsDir));
});

gulp.task('styles', function () {
  return gulp.src(watchFiles.sassFiles)
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(sourcemap.write())
    .pipe(gulp.dest(watchFiles.cssDir));
});

gulp.task('copy-dev', [ 'clean' ], function () {
  return gulp.src([
    watchFiles.allFiles,
    watchFiles.ignoreApp,
    watchFiles.ignoreSass,
    watchFiles.ignoreMarkdown,
    watchFiles.ignoreViews,
    watchFiles.ignoreDependencies
  ], {
    cwd: watchFiles.assetsDir
  })
  .pipe(gulp.dest(watchFiles.devDir));
});

gulp.task('copy-build', [ 'dev' ], function () {
  return gulp.src(watchFiles.devDir + '**')
    .pipe(gulp.dest(watchFiles.buildDir));
});

gulp.task('uglify', [ 'copy-build' ], function () {
  return gulp.src(watchFiles.buildDir + 'js/**')
    .pipe(uglify())
    .pipe(gulp.dest(watchFiles.buildDir + 'js/'));
});

gulp.task('minify-css', [ 'copy-build' ], function () {
  gulp.src(watchFiles.buildDir + 'css/**')
    .pipe(minifyCss())
    .pipe(gulp.dest(watchFiles.buildDir + 'css/'));
});

gulp.task('watch', function () {
  gulp.watch([ watchFiles.assetsDir + 'index.html' ], [ 'copy-dev' ]);
  gulp.watch([ watchFiles.appFiles ], [ 'app', 'copy-dev' ]);
  gulp.watch([ watchFiles.viewFiles ], [ 'templates', 'copy-dev' ]);
  gulp.watch([ watchFiles.sassFiles ], [ 'styles', 'copy-dev' ]);
  gulp.watch([ watchFiles.imageFiles ], [ 'copy-dev' ]);
  gulp.watch([ watchFiles.dependencyFiles ], [ 'bower-files', 'copy-dev' ]);
});

gulp.task('dev', [
  'clean',
  'templates',
  'bower-files',
  'app',
  'styles',
  'copy-dev'
]);

gulp.task('build', [
  'uglify',
  'minify-css'
]);

gulp.task('serve', [ 'dev', 'watch' ], function () {
  nodemon({
    script: 'server.js',
    ext: 'js html',
    env: {
      port: config.server.port,
      callback: function (nodemon) {
        nodemon.on('log', function (event) {
          console.log(event.colour);
        });
      }
    }
  });
});
