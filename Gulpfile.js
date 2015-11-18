var gulp = require('gulp'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    inject = require('gulp-inject'),
    fs = require('fs'),
    uglify = require('gulp-uglify'),
    bowerFiles = require('main-bower-files'),
    extend = require('node.extend'),
    rename = require("gulp-rename"),
    argv = require("yargs").argv,
    gulpFilter = require('gulp-filter'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint');
    stylish = require('jshint-stylish'),
    merge = require('merge-stream'),
    templateCache = require('gulp-angular-templatecache'),
    preprocess = require('gulp-preprocess'),
    less = require('gulp-less'),
    minifyHTML = require('gulp-minify-html'),
    gutil = require('gulp-util'),
    minifyCss = require('gulp-minify-css'),
    nop = require('gulp-nop'),
    ngHtml2Js = require("gulp-ng-html2js"),
    angularProtractor = require('gulp-angular-protractor');

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
    gutil.log('OMG! It\'s production build');
    path.app = path.dist;
}

var pathToVendors = path.app + dirVendors;

// update config (combine common with local and env configs)