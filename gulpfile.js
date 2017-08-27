var gulp = require('gulp');
// var uglify = require('gulp-uglify');
// var inject = require('gulp-inject');
// var useref = require('gulp-useref');
// var filter = require('gulp-filter');
// var ngAnnotate = require('gulp-ng-annotate');
// var htmlify = require('gulp-angular-htmlify');
// var minifyCss = require('gulp-minify-css');
// var minifyHtml = require('gulp-minify-html');
// var templateCache = require('gulp-angular-templatecache');
// var angularFilesort = require('gulp-angular-filesort');
// var del = require('del');
// var size = require('gulp-filesize');
// var rev = require('gulp-rev');
// var git = require('gulp-git');
// var bump = require('gulp-bump');
// var tag_version = require('gulp-tag-version');
var sass = require('gulp-sass');

// gulp.task('default', ['build', 'templates'], function() {});

// // Remove the dist directory
// gulp.task('clean', function(cb) {
//   del(['dist'], cb);
// });

// // Put all templates in a templateCache
// gulp.task('templates', function() {
//   return gulp
//     .src('src/templates/**/*.html')
//     .pipe(
//       htmlify({
//         customPrefixes: ['my-'],
//       }),
//     )
//     .pipe(minifyHtml())
//     .pipe(
//       templateCache({
//         root: 'src/templates/',
//         module: 'cardboard',
//       }),
//     )
//     .pipe(rev())
//     .pipe(size())
//     .pipe(gulp.dest('dist'));
// });

// // Inject App files (no bower_components) in index.html for development
// gulp.task('inject', function() {
//   gulp
//     .src('index.html')
//     .pipe(inject(gulp.src('src/**/*.css', { read: false })))
//     .pipe(inject(gulp.src('src/**/*.js').pipe(angularFilesort())))
//     .pipe(gulp.dest('./'));
// });

// // Build a production-ready dist folder
// gulp.task('build', ['templates'], function() {
//   // copy the manifest to dist/
//   gulp.src('manifest.json').pipe(gulp.dest('dist'));

//   // copy resources/ to dist/
//   gulp.src('resources/**').pipe(gulp.dest('dist/resources'));

//   // copy materialize fonts to dist/
//   gulp
//     .src('bower_components/materialize/dist/font/**')
//     .pipe(gulp.dest('dist/font'));

//   var assets = useref.assets();
//   // var bowerUnMinJs = filter(['bower_components/**/*.js','!bower_components/**/*.min.js','!google-analytics-bundle.js']);
//   // var appJs = filter(['src/**/*.js']);
//   // var unMinCss = filter(['*.css','!*.min.css']);

//   return (gulp
//       .src('index.html')
//       // inject css in index.html
//       .pipe(inject(gulp.src('src/**/*.css', { read: false })))
//       // inject cached templates in index.html
//       .pipe(
//         inject(
//           gulp.src('templates-*.js', {
//             read: false,
//             cwd: 'dist/',
//           }),
//           {
//             name: 'templates',
//             addRootSlash: false,
//           },
//         ),
//       )
//       // inject app files in index.html
//       .pipe(inject(gulp.src('src/**/*.js').pipe(angularFilesort())))
//       // get build blocks assets
//       .pipe(assets)
//       // // exclude the already minified JS files
//       // .pipe(bowerUnMinJs)
//       // .pipe(size())
//       // // minify
//       // .pipe(uglify())
//       // .pipe(bowerUnMinJs.restore())
//       // // exclude the already minified CSS files
//       // .pipe(unMinCss)
//       // .pipe(size())
//       // // minify
//       // .pipe(minifyCss())
//       // .pipe(unMinCss.restore())
//       // // restore filtered stream
//       .pipe(assets.restore())
//       // concat build blocks
//       .pipe(useref())
//       // .pipe(htmlify({
//       //     customPrefixes: ['my-']
//       // }))
//       .pipe(size())
//       .pipe(gulp.dest('dist/')) );
// });

gulp.task('sass', function() {
  return gulp
    .src('src/styles/custom.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/styles/'));
});

gulp.task('sass:watch', function() {
  gulp.watch('src/styles/*.scss', ['sass']);
});

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */

// function inc(importance) {
//   // get all the files to bump version in
//   return (
//     gulp
//       .src(['./manifest.json', './package.json', './bower.json'])
//       // bump the version number in those files
//       .pipe(bump({ type: importance }))
//       // save it back to filesystem
//       .pipe(gulp.dest('./'))
//       // commit the changed version number
//       .pipe(git.commit('bumps package version'))
//       // read only one file to get the version number
//       .pipe(filter('manifest.json'))
//       // **tag it in the repository**
//       .pipe(tag_version())
//   );
// }

// gulp.task('patch', function() {
//   return inc('patch');
// });
// gulp.task('feature', function() {
//   return inc('minor');
// });
// gulp.task('release', function() {
//   return inc('major');
// });
