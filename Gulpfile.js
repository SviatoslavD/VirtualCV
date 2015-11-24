var gulp = require('gulp'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'), // Prevent pipe breaking caused by errors from gulp plugins
    inject = require('gulp-inject'), // nject file references into your index.html
    fs = require('fs'),
    uglify = require('gulp-uglify'),
    bowerFiles = require('main-bower-files'),
    extend = require('node.extend'),         // A port of jQuery.extend that actually works on node.js
    rename = require("gulp-rename"),
    argv = require("yargs").argv,
    gulpFilter = require('gulp-filter'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint');
    stylish = require('jshint-stylish'),
    merge = require('merge-stream'),
    templateCache = require('gulp-angular-templatecache'),
    preprocess = require('gulp-preprocess'), // plugin to preprocess HTML, JavaScript, and other files based on custom context or environment configuration
    less = require('gulp-less'),
    minifyHTML = require('gulp-minify-html'),
    gutil = require('gulp-util'),
    minifyCss = require('gulp-minify-css'),
    nop = require('gulp-nop'),
    ngHtml2Js = require("gulp-ng-html2js");

// app main config file
var config = require('./config.json'),
    env = (argv.env || 'debug').toLowerCase(),
    isBuild = env !== 'debug',
    uglifySources = !/debug|dev/.test(env), //  test() method tests for a match in a string
    appModule = 'VirtualCV',
    dirVendors = 'vendors/',
    buildVersion = (new Date()).getTime(),
    buildVersionUrlParam = '?bust' + buildVersion,
    pathToBowerJson = './bower.json',
    path = {
        src: 'ui/src/',
        dist: 'ui/dist/',
        app: 'ui/src/',
        urlStatic: isBuild ? '/static/' + buildVersion + '/' : '/',
        distStatic: 'ui/dist/' + (isBuild ? 'static/' + buildVersion + '/' : '')
    }

if(isBuild) {
    gutil.log('OMG! It\'s build');
    path.app = path.dist;
}

var pathToVendors = path.app + dirVendors;

// update config (combine common with local and env configs)
config[env].VERSION = buildVersion;
config[env].DEBUG = !isBuild;
config[env].ENV = env;
config[env].STATICDIR = path.urlStatic;
var appConfig = extend(true, config.common, config[env]);
var appConfigStr = JSON.stringify(appConfig);

// application
// var app = 'app';

gutil.log('Running env = ' + env);
gutil.log('[path] src = ' + path.src);
gutil.log('[path] dist = ' + path.dist);
gutil.log('[path] app = ' + path.app);
gutil.log('[path] urlStatic = ' + path.urlStatic);
gutil.log('[path] distStatic = ' + path.distStatic);
gutil.log('[path] pathToVendors = ' + pathToVendors);
gutil.log('[path] pathToBowerJson = ' + pathToBowerJson);

// compile scss files into css
gulp.task('app:css:clean', cleanCss);
gulp.task('app:css:init', ['app:css:clean'], initCss);
gulp.task('app:css:transform', ['app:css:init'], genCss);
gulp.task('app:css', ['app:css:transform'], function () {
    return gulp.src(['assets/css/**/*.less', 'assets/css/**/_**'], {cwd: path.app}).pipe(clean());
});

// validate JS
gulp.task('app:lintjs', lintJS);

// generate root htmls from tpl files
gulp.task('app:html', ['app:css'], genHtml);

// run watcher
gulp.task('app:watch', watchLocalChanges);

function watchLocalChanges () {
    gulp.watch('ui/src/app/**/*.js', ['app:lintjs']);
    gulp.watch('ui/src/assets/styles/**', ['app:css']);
    gulp.watch('ui/src/*.tpl.html', ['app:html']);
    gulp.watch('config*.json', ['app:html']);
    gulp.watch('bower.json', ['app:html']);
    gulp.watch('.jshintrc', ['app:lintjs']);
}

function injectAppVars () {
    gutil.log('-----------Inject APP vars--------');
    var appvars = {
        CONFIG: appConfigStr,
        CONFIGJSON: appConfig,
        STATICDIR: path.urlStatic,
        VERSION: buildVersion,
        BUST: buildVersionUrlParam
    };
    return preprocess({context: appvars});
}

function cleanCss () {
    gutil.log('***clean CSS***');
    return gulp.src(path.app + 'assets/css/').pipe(clean());
}

// src takes an array of source paths
// dest copies results to given dir
// pipe chains all tasks together
// cwd - change working dir
function initCss () {
    gutil.log('***init CSS***');
    return gulp.src(['assets/styles/**/*'], {cwd: path.app})
        .pipe(injectAppVars())
        .pipe(gulp.dest('css', {cwd: path.app + 'assets/'})); // create folder if don't exist 
}

function genCss () {
    gutil.log("***generate CSS***");
    return gulp.src('*.less', {cwd: path.app + 'assets/css/'})
        .pipe(plumber({errorHandler: handleError}))
        .pipe(less({
            path: [path.app, path.app + 'assets/css/']
        }))
        .pipe(uglifySources ? minifyCss({processImport: false}) : nop())
        .pipe(gulp.dest('.', {cwd: path.app + 'assets/css/'}));
        /// return LESS
}

function lintJS () {
    gutil.log('lintJS - running');
    return gulp.src(['app/**/*.js'], {cwd: path.app})
        .pipe(jshint())
        .pipe(jshint.reporter(stylish)) //  log the errors using the stylish reporter
        .pipe(jshint.reporter('default')); //  then run default if JSHint was not a success.
}

function genHtml () {
    return gulp.src(['index.tpl.html'], {cwd: path.app})
        .pipe(injectAppVars())
        .pipe(injectAppScripts())
        .pipe(injectVendors())
        .pipe(rename('index.html'))
        .pipe(gulp.dest(path.app));
}

// inject file references into index.html
function injectAppScripts () {
    gutil.log('---------Inject APP scripts-------');
    var jsAppFiles = ['app/app.js', 'app/**/*.js'];
    return inject(gulp.src(jsAppFiles,
        {read: false, cwd: path.app}),
        {relative: true, transform: transform, name: 'index'});
}

// inject vendor scripts (bower)
function injectVendors () {
    gutil.log('-----------Inject Vendor scripts--------');
    var jsVendorsFiles = bowerFiles({filter: /.*\.js$/, paths: {bowerJson: pathToBowerJson, bowerDirectory: pathToVendors}});
    return inject(gulp.src(jsVendorsFiles, 
        {cwd: path.app}),
        {relative: true, transform: transform, name: 'bower'});
}

function transform (filepath, file, i, length) {
    if(filepath.indexOf('.js') > -1) {
        return '<script crossorigin="anonymous" src="' + getBustedFile(filepath) + '"></script>';
    } else {
        return '<link rel="stylesheet" type="text/css" href="' + getBustedFile(filepath) + '"/>';
    }
}

// simple wrapper for injected files that adds the bust param
function getBustedFile (fileName) {
    return path.urlStatic + fileName + buildVersionUrlParam;
}

function handleError () {
    gutil.log(err.toString());
    this.emit('end')
}

/******* startup taks *******/

// default task
if (isBuild) {
    gulp.task('def', function () {
        gutil.log('***BUILD***')
    });
} else {
    gulp.task('default', ['app:html'], watchLocalChanges);
}