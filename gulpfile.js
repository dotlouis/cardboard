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

var fs = require("fs");
var ChromeExtension = require("crx");
var join = require("path").join;

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
            js: [ngAnnotate({single_quotes: true}), uglify(), rev()],
            bower: [uglify(), rev()]
        }))
        .pipe(htmlify({
            customPrefixes: ['my-']
        }))
        .pipe(minifyHtml())
        .pipe(size())
        .pipe(gulp.dest('dist/'));
});

gulp.task('pack',['build'], function(){
    var crx = new ChromeExtension({
        codebase: "cardboard.crx",
        privateKey: fs.readFileSync("cardboard.pem")
    });

    return crx.load('dist/')
    .then(function() {
        return crx.pack().then(function(crxBuffer){
            fs.writeFile('dist/cardboard.crx', crxBuffer);
        })
    });
});
