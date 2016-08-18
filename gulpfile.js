var gulp = require('gulp');
var htmlhint = require('gulp-htmlhint');
var htmlmin = require('gulp-htmlmin');
var svgmin = require('gulp-svgmin');
var templatecache = require('gulp-angular-templatecache');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var inject = require('gulp-inject');

var karma = require('karma');

var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var typescript = require('rollup-plugin-typescript');
var commonjs = require('rollup-plugin-commonjs');
var nodeResolve = require('rollup-plugin-node-resolve');

var config = require('./config.json');

// set to true when the default task is running and we're watching
// for file changes. This is used to prevent errors from failing the
// build and exiting the process.
var watching = process.argv.length == 2 || process.argv[2] == 'default';

// Config for htmlmin when processing templates
var htmlMinOptions = {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true
}

// Compiles and bundles TypeScript to JavaScript
function compile(source, destination) {
  return rollup.rollup({
    entry: source,
    plugins: [
      typescript({
        target: 'ES6',
        module: 'es2015',
        moduleResolution: 'node',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        noImplicitAny: true,
        removeComments: true,
        typescript: require('typescript')
      }),
      babel({
        exclude: 'node_modules/**/*.js',
        presets: [["es2015", { modules: false }]],
        plugins: ["external-helpers"]
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        extensions: ['.js', '.ts', '.json'],
        preferBuiltins: false
      })
    ],
    sourceMap: true
  }).then(bundle => {
    return bundle.write({ dest: destination });
  })
}

/**********************************************************************
 * Tasks to build the library
 */

gulp.task('images', () => {
  return gulp.src('src/**/*.svg')
    .pipe(svgmin())
    .pipe(templatecache({
      filename: 'images.js',
      module: config.moduleName,
      transformUrl: url => config.moduleName + '/' + url
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('templates', (cb) => {
  return gulp.src(['src/**/*.html'])
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(watching ? htmlhint.reporter() : htmlhint.failReporter())
    .pipe(htmlmin(htmlMinOptions))
    .pipe(templatecache({
      module: config.moduleName,
      transformUrl: url => config.moduleName + '/' + url
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('styles', () => {
  return gulp.src('src/styles.scss')
    .pipe(inject(gulp.src('src/**/_*.scss'), {
      starttag: '/* inject:imports */',
      endtag: '/* endinject */',
      transform: filepath => '@import ".' + filepath + '";'
    }))
    .pipe(gulp.dest('./'))
})

gulp.task('build', ['images', 'templates', 'styles']);

gulp.task('default', ['build'], () => {
  watch(['src/**/*.svg', 'src/**/*.html'], () => gulp.start('build'));
});

gulp.task('clean', cb => {
  var del = require('del');
  del(['build/**/*', '.tmp/**/*'], cb);
});

/**********************************************************************
 * Tasks to build and run the demo
 */

gulp.task('demo:compile', ['build', 'demo:images', 'demo:templates'], () => {
  return compile('demo/index.ts', '.tmp/demo/js/main.js');
})

gulp.task('demo:styles', ['styles'], () => {
  return gulp.src('demo/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp/demo/css'));
})

gulp.task('demo:templates', () => {
  return gulp.src(['demo/**/*.html'])
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(watching ? htmlhint.reporter() : htmlhint.failReporter())
    .pipe(htmlmin(htmlMinOptions))
    .pipe(templatecache({ module: 'demoApp' }))
    .pipe(gulp.dest('.tmp/build'));
})

gulp.task('demo:images', () => {
  return gulp.src('demo/**/*.svg')
    .pipe(svgmin())
    .pipe(templatecache({
      filename: 'images.js',
      module: 'demoApp'
    }))
    .pipe(gulp.dest('.tmp/build'));
})

gulp.task('demo:build', ['demo:compile', 'demo:styles'], () => {
  return gulp.src('demo/index.html')
    .pipe(gulp.dest('.tmp/demo'));
})

gulp.task('demo', ['demo:build'], () => {
  var bs = browserSync.create();

  watch(['src/**/*', 'demo/**/*'], () => {
    gulp.start('demo:build');
  });

  bs.watch('.tmp/demo/**/*').on('change', bs.reload);

  bs.init({
    open: true,
    reloadOnRestart: true,
    server: {
      baseDir: ['.tmp/demo']
    }
  });
})

/**********************************************************************
 * Tasks to build and run the tests
 */

gulp.task('spec:inject', () => {
  return gulp.src('src/spec.ts')
    .pipe(inject(gulp.src('src/**/*.spec.ts'), {
      starttag: '/* inject:specs */',
      endtag: '/* endinject */',
      transform: filepath => "import '.." + filepath + "';"
    }))
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('spec:compile', ['spec:inject'], () => {
  return compile('.tmp/spec.ts', '.tmp/spec.js');
})

gulp.task('spec', ['demo:build', 'spec:compile'], (cb) => {
  var path = require('path');
  new karma.Server(
    { configFile: path.resolve('karma.conf.js') },
    exitCode => {
      console.log('exit code', exitCode)
      if (exitCode != 0) {
        process.exit(1);
      }
      cb();
    }).start();
});

gulp.task('spec:debug', ['spec:compile'], (cb) => {
  var path = require('path');
  new karma.Server(
    {
      configFile: path.resolve('karma.conf.js'),
      browsers: ['Chrome'],
      singleRun: false
    }).start();
});
