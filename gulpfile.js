var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var connect = require('gulp-connect');
var rename = require('gulp-rename');
var ghPages = require('gulp-gh-pages');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// App's data
function LoadDataForApp() {
    return require('./src/app.json');
}
nunjucksRender.nunjucks.configure(['src/templates/']);


// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath).mode
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ]).then(function () {
        done();
    });
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:license',
    'copy:fontawesome',
    'copy:glyphicons',
    'copy:semantic',
    'copy:main.css',
    'copy:misc',
    'copy:normalize'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
               .pipe(plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
               .pipe(data(LoadDataForApp))
               .pipe(nunjucksRender())
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
               .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:license', function () {
    return gulp.src('LICENSE.txt')
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:fontawesome', function () {
    gulp.src(['node_modules/font-awesome/css/font-awesome.min.css'])
               .pipe(gulp.dest(dirs.dist + '/css'));
    gulp.src(['node_modules/font-awesome/fonts/**/*'])
               .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:glyphicons', function () {
    gulp.src(['node_modules/ccm_assets/glyphicons/web/html_css/css/glyphicons.css'])
               .pipe(gulp.dest(dirs.dist + '/css'));
    gulp.src(['node_modules/ccm_assets/glyphicons/web/html_css/fonts/**/*'])
               .pipe(gulp.dest(dirs.dist + '/fonts'));
});

gulp.task('copy:semantic', function () {
    gulp.src(['semantic/dist/semantic.min.js'])
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
    gulp.src(['semantic/dist/semantic.min.css'])
               .pipe(gulp.dest(dirs.dist + '/css'));
    gulp.src(['semantic/dist/themes/**/*'])
               .pipe(gulp.dest(dirs.dist + '/css/themes'));
});

gulp.task('copy:main.css', function () {

    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
                    ' | ' + pkg.license.type + ' License' +
                    ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
               .pipe(data(LoadDataForApp))
               .pipe(nunjucksRender())
               .pipe(rename({
                   extname: '.css'
               }))
               .pipe(plugins.header(banner))
               .pipe(plugins.autoprefixer({
                   browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
                   cascade: false
               }))
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/templates',
        '!' + dirs.src + '/templates/**/*',
        '!' + dirs.src + '/pages',
        '!' + dirs.src + '/pages/**/*',
        '!' + dirs.src + '/index.html',
        '!' + dirs.src + '/app.json'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:normalize', function () {
    return gulp.src('node_modules/normalize.css/normalize.css')
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(plugins.jscs())
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('reload', function() {
    return gulp.src(dirs.dist)
               .pipe(connect.reload());
});

gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
               .pipe(ghPages());
});


// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        ['clean', 'lint:js'],
        'copy', 'reload',
    done);
});

gulp.task('watch', function() {
    gulp.watch(dirs.src + '/**/*.*', ['build']);
});

gulp.task('connect', function() {
    connect.server({
        root: dirs.dist,
        livereload: true
    });
});

gulp.task('default', ['build', 'connect', 'watch']);
