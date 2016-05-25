'use strict';

/*global require*/
// Every module required-in here must be a `dependency` in package.json, not just a `devDependency`,
// This matters if ever we have gulp tasks run from npm, especially post-install ones.
var gulp = require('gulp');
var jsoncombine = require('gulp-jsoncombine');
var gutil = require('gulp-util');
var symlink = require('gulp-symlink');
var path = require('path');

gulp.task('build', ['build-css', 'merge-datasources', 'copy-terriajs-assets', 'build-app']);
gulp.task('release', ['build-css', 'copy-terriajs-assets', 'release-app', 'make-editor-schema']);
gulp.task('watch', ['watch-css', 'watch-terriajs-assets', 'watch-app']);
gulp.task('default', ['make-dirs', 'make-symlinks', 'inject-files', 'lint', 'build']);

var watchOptions = {
    interval: 1000
};

gulp.task('make-dirs', function(done) {
    var fs = require('fs');
    if (!fs.existsSync('lib')) { fs.mkdirSync('lib') };
    if (!fs.existsSync('lib/Views')) { fs.mkdirSync('lib/Views') };
    if (!fs.existsSync('lib/Styles')) { fs.mkdirSync('lib/Styles') };
    if (!fs.existsSync('wwwroot')) { fs.mkdirSync('wwwroot') };
    if (!fs.existsSync('wwwroot/images')) { fs.mkdirSync('wwwroot/images') };
    if (!fs.existsSync('buildprocess')) { fs.mkdirSync('buildprocess') };
    if (!fs.existsSync('prod')) { fs.mkdirSync('prod') };
    if (!fs.existsSync('prod/init')) { fs.mkdirSync('prod/init') };
    if (!fs.existsSync('test')) { fs.mkdirSync('test') };
    if (!fs.existsSync('test/init')) { fs.mkdirSync('test/init') };
    if (!fs.existsSync('demo')) { fs.mkdirSync('demo') };
    if (!fs.existsSync('demo/init')) { fs.mkdirSync('demo/init') };
});

gulp.task('inject-files', function(done) {
    gulp.src([
            '../build-data/html/RelatedMaps.html'
        ], { base: '../build-data/html' })
    .pipe(gulp.dest('lib/Views'));
    gulp.src([
            '../build-data/html/index.html'
        ], { base: '../build-data/html' })
    .pipe(gulp.dest('wwwroot'));
    gulp.src([
            '../build-data/less/leylines.less'
        ], { base: '../build-data/less' })
    .pipe(gulp.dest('lib/Styles'));
    gulp.src([
            '../build-data/images/**'
        ], { base: '../build-data/images' })
    .pipe(gulp.dest('wwwroot/images'));
    gulp.src([
            '../build-data/buildprocess/**'
        ], { base: '../build-data/buildprocess' })
    .pipe(gulp.dest('buildprocess'));
    gulp.src([
            '../build-data/terriajs/createGlobalBaseMapOptions.js'
        ], { base: '../build-data/terriajs' })
    .pipe(gulp.dest('node_modules/terriajs/lib/ViewModels'));
    gulp.src([
            '../build-data/lib/*.js'
        ], { base: '../build-data/lib' })
    .pipe(gulp.dest('node_modules/terriajs-server/lib'));
    gulp.src([
            '../build-data/terriajs-server/app.js'
        ], { base: '../build-data/terriajs-server' })
    .pipe(gulp.dest('node_modules/terriajs-server/lib'));
    gulp.src([
            '../build-data/terriajs-config/config.json'
        ], { base: '../build-data/terriajs-config' })
    .pipe(gulp.dest('wwwroot'));
    gulp.src([
            '../build-data/terriajs-server-config/*.json'
        ], { base: '../build-data/terriajs-server-config' })
    .pipe(gulp.dest('node_modules/terriajs-server'));
    gulp.src([
            '../build-data/cesium-js/CzmlDataSource.js'
        ], { base: '../build-data/cesium-js' })
    .pipe(gulp.dest('node_modules/terriajs-cesium/Source/DataSources'));
    return;
});

gulp.task('make-symlinks', function () {
    gulp.src('wwwroot/images')
      .pipe(symlink('wwwroot/build/TerriaJS/images-leylines',{force: true}))
    gulp.src('wwwroot/images')
      .pipe(symlink('prod/images',{force: true}))
    gulp.src('wwwroot/images')
      .pipe(symlink('demo/images',{force: true}))
    gulp.src('wwwroot/images')
      .pipe(symlink('test/images',{force: true}))
    gulp.src('wwwroot/build')
      .pipe(symlink('prod/build',{force: true}))
    gulp.src('wwwroot/build')
      .pipe(symlink('demo/build',{force: true}))
    gulp.src('wwwroot/build')
      .pipe(symlink('test/build',{force: true}))
    gulp.src('wwwroot/html')
      .pipe(symlink('prod/html',{force: true}))
    gulp.src('wwwroot/html')
      .pipe(symlink('demo/html',{force: true}))
    gulp.src('wwwroot/html')
      .pipe(symlink('test/html',{force: true}))
    gulp.src('../geo-data')
      .pipe(symlink('prod/geo-data',{force: true}))
    gulp.src('../geo-data')
      .pipe(symlink('demo/geo-data',{force: true}))
    gulp.src('../geo-data')
      .pipe(symlink('test/geo-data',{force: true}))
    gulp.src('node_modules/terriajs/wwwroot/doc')
      .pipe(symlink('wwwroot/html/doc',{force: true}))
    gulp.src('../www')
      .pipe(symlink('www',{force: true}))
    gulp.src('wwwroot/index.html')
      .pipe(symlink('prod/index.html',{force: true}))
    gulp.src('wwwroot/index.html')
      .pipe(symlink('test/index.html',{force: true}))
    gulp.src('wwwroot/index.html')
      .pipe(symlink('demo/index.html',{force: true}))
    gulp.src('wwwroot/config.json')
      .pipe(symlink('prod/config.json',{force: true}))
    gulp.src('wwwroot/config.json')
      .pipe(symlink('test/config.json',{force: true}))
    gulp.src('wwwroot/config.json')
      .pipe(symlink('demo/config.json',{force: true}))
    return;
});

gulp.task('merge-datasources', function() {
    var jsonspacing=0;
    gulp.src("../build-data/datasources-prod/*.json")
        .pipe(jsoncombine("leylines.json", function(data) {
        // be absolutely sure we have the files in alphabetical order, with 000_settings first.
        var keys = Object.keys(data).slice().sort();
        data[keys[0]].catalog = [];

        for (var i = 1; i < keys.length; i++) {
            data[keys[0]].catalog.push(data[keys[i]].catalog[0]);
        }
        return new Buffer(JSON.stringify(data[keys[0]], null, jsonspacing));
    }))
    .pipe(gulp.dest("./prod/init"));

    gulp.src("../build-data/datasources-demo/*.json")
        .pipe(jsoncombine("leylines.json", function(data) {
        // be absolutely sure we have the files in alphabetical order, with 000_settings first.
        var keys = Object.keys(data).slice().sort();
        data[keys[0]].catalog = [];

        for (var i = 1; i < keys.length; i++) {
            data[keys[0]].catalog.push(data[keys[i]].catalog[0]);
        }
        return new Buffer(JSON.stringify(data[keys[0]], null, jsonspacing));
    }))
    .pipe(gulp.dest("./demo/init"));

    gulp.src("../build-data/datasources-test/*.json")
        .pipe(jsoncombine("leylines.json", function(data) {
        // be absolutely sure we have the files in alphabetical order, with 000_settings first.
        var keys = Object.keys(data).slice().sort();
        data[keys[0]].catalog = [];

        for (var i = 1; i < keys.length; i++) {
            data[keys[0]].catalog.push(data[keys[i]].catalog[0]);
        }
        return new Buffer(JSON.stringify(data[keys[0]], null, jsonspacing));
    }))
    .pipe(gulp.dest("./test/init"));
    return;
});

gulp.task('build-app', ['write-version'], function(done) {
    var runWebpack = require('terriajs/buildprocess/runWebpack.js');
    var webpack = require('webpack');
    var webpackConfig = require('./buildprocess/webpack.config.js');

    runWebpack(webpack, webpackConfig, done);
});

gulp.task('release-app', ['write-version'], function(done) {
    var runWebpack = require('terriajs/buildprocess/runWebpack.js');
    var webpack = require('webpack');
    var webpackConfig = require('./buildprocess/webpack.config.js');

    runWebpack(webpack, Object.assign({}, webpackConfig, {
        plugins: [
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurrenceOrderPlugin()
        ].concat(webpackConfig.plugins || [])
    }), done);
});

gulp.task('watch-app', function(done) {
    var fs = require('fs');
    var watchWebpack = require('terriajs/buildprocess/watchWebpack');
    var webpack = require('webpack');
    var webpackConfig = require('./buildprocess/webpack.config.js');

    fs.writeFileSync('version.js', 'module.exports = \'Development Build\';');
    watchWebpack(webpack, webpackConfig, done);
});

gulp.task('build-css', function() {
    var less = require('gulp-less');
    var NpmImportPlugin = require('less-plugin-npm-import');
    var rename = require('gulp-rename');

    return gulp.src('./index.less')
        .on('error', onError)
        .pipe(less({
            plugins: [
                new NpmImportPlugin()
            ]
        }))
        .pipe(rename('leylines.css'))
        .pipe(gulp.dest('./wwwroot/build/'));
});

gulp.task('watch-css', ['build-css'], function() {
    var terriaStylesGlob = path.join(getPackageRoot('terriajs'), 'lib', 'Styles', '**', '*.less');
    var appStylesGlob = path.join(__dirname, 'lib', 'Styles', '**', '*.less');
    return gulp.watch(['./index.less', terriaStylesGlob, appStylesGlob], watchOptions, ['build-css']);
});

gulp.task('copy-terriajs-assets', function() {
    var terriaWebRoot = path.join(getPackageRoot('terriajs'), 'wwwroot');
    var sourceGlob = path.join(terriaWebRoot, '**');
    var destPath = path.resolve(__dirname, 'wwwroot', 'build', 'TerriaJS');

    return gulp
        .src([ sourceGlob ], { base: terriaWebRoot })
        .pipe(gulp.dest(destPath));
});

gulp.task('watch-terriajs-assets', ['copy-terriajs-assets'], function() {
    var terriaWebRoot = path.join(getPackageRoot('terriajs'), 'wwwroot');
    var sourceGlob = path.join(terriaWebRoot, '**');

    return gulp.watch(sourceGlob, watchOptions, [ 'copy-terriajs-assets' ]);
});

// Generate new schema for editor, and copy it over whatever version came with editor.
gulp.task('make-editor-schema', ['copy-editor'], function() {
    var generateSchema = require('generate-terriajs-schema');

    return generateSchema({
        source: getPackageRoot('terriajs'),
        dest: 'wwwroot/editor',
        noversionsubdir: true,
        editor: true,
        quiet: true
    });
});

gulp.task('copy-editor', function() {
    var glob = path.join(getPackageRoot('terriajs-catalog-editor'), '**');

    return gulp.src(glob)
        .pipe(gulp.dest('./wwwroot/editor'));
});

gulp.task('lint', function() {
    var runExternalModule = require('terriajs/buildprocess/runExternalModule');

    runExternalModule('eslint/bin/eslint.js', [
        '-c', path.join(getPackageRoot('terriajs'), '.eslintrc'),
        '--ignore-pattern', 'lib/ThirdParty',
        '--max-warnings', '0',
        'index.js',
        'lib'
    ]);
});

gulp.task('write-version', function() {
    var fs = require('fs');
    var dateFormat = require('dateformat');
    var spawnSync = require('child_process').spawnSync;

    // Get a version string from "git describe".
    //var version = spawnSync('git', ['describe']).stdout.toString().trim();
    //var isClean = spawnSync('git', ['status', '--porcelain']).stdout.toString().length === 0;
    //if (!isClean) {
    //    version += ' (plus local modifications)';
    //}
    var currentTime = new Date();
    var version = dateFormat(currentTime, "isoDateTime");

    fs.writeFileSync('version.js', 'module.exports = \'' + version + '\';');
});

function onError(e) {
    if (e.code === 'EMFILE') {
        console.error('Too many open files. You should run this command:\n    ulimit -n 2048');
        process.exit(1);
    } else if (e.code === 'ENOSPC') {
        console.error('Too many files to watch. You should run this command:\n' +
                    '    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p');
        process.exit(1);
    }
    gutil.log(e.message);
    process.exit(1);
}

function getPackageRoot(packageName) {
    return path.dirname(require.resolve(packageName + '/package.json'));
}
