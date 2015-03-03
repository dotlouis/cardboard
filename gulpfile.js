var gulp = require('gulp');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var ngAnnotate = require('gulp-ng-annotate');
var htmlify = require('gulp-angular-htmlify');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var templateCache = require('gulp-angular-templatecache');
var angularFilesort = require('gulp-angular-filesort');
var del = require('del');
var size = require('gulp-filesize');
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

gulp.task('default',['build', 'templates'], function(){

});

// Remove the dist directory
gulp.task('clean', function(cb) {
    del(['dist'], cb);
});

// Put all templates in a templateCache
gulp.task('templates', function(){
    return gulp.src('src/templates/**/*.html')
        .pipe(htmlify({
            customPrefixes: ['my-']
        }))
        .pipe(minifyHtml())
        .pipe(templateCache({
            root: 'src/templates/',
            module: 'cardboard'
        }))
        .pipe(rev())
        .pipe(size())
        .pipe(gulp.dest('dist'));
});

// Inject App files (no bower_components) in index.html for development
gulp.task('inject', function(){
    gulp.src('index.html')
        .pipe(inject(gulp.src('src/**/*.css',{read: false})))
        .pipe(inject(
            gulp.src('src/**/*.js')
            .pipe(angularFilesort())
        ))
        .pipe(gulp.dest('./'));
});

// Build a production-ready dist folder
gulp.task('build',['templates'], function(){
    gulp.src('manifest.json')
        .pipe(gulp.dest('dist'));

    gulp.src('resources/**')
        .pipe(gulp.dest('dist/resources'));

    gulp.src('bower_components/materialize/font/**')
        .pipe(gulp.dest('dist/font'));

    gulp.src('bower_components/**')
        .pipe(gulp.dest('dist/bower_components'));

    return gulp.src('index.html')
        .pipe(inject(gulp.src('src/**/*.css',{read: false})))
        .pipe(inject(
            gulp.src('templates-*.js',{
                read: false,
                cwd: 'dist/'
            }),
            {
                name: 'templates',
                addRootSlash: false
            }
        ))
        .pipe(inject(
            gulp.src('src/**/*.js')
            .pipe(angularFilesort())
        ))
        .pipe(usemin({
            css: [minifyCss({
                keepSpecialComments: 0
            }), rev()],
            js: [ngAnnotate({single_quotes: true}), uglify(), rev()]
        }))
        .pipe(htmlify({
            customPrefixes: ['my-']
        }))
        // .pipe(minifyHtml())
        .pipe(size())
        .pipe(gulp.dest('dist/'));
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

function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./manifest.json','./package.json', './bower.json'])
        // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('bumps package version'))
        // read only one file to get the version number
        .pipe(filter('manifest.json'))
        // **tag it in the repository**
        .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })
