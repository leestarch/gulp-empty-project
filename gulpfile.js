'use strict';
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-html-minifier'),
    browserSync = require("browser-sync"),
    rename = require('gulp-rename'),
    csso = require('gulp-csso'),
    merge = require('merge-stream'),
    reload = browserSync.reload;

var path = {
    build: {
        html: './build/',
        js: './build/assets/js/',
        style: './build/assets/css/',
        img: './build/assets/img/',
        fonts: './build/assets/fonts/'
    },
    src: {
        html: [
            './src/*.html',
            '!./src/*.inc.html'
        ],
        js: './src/assets/js/main.js',
        style: {
            sass: './src/assets/style/**/*.sass',
            css: './src/assets/style/**/*.css'
        },
        img: './src/assets/img/*.*',
        fonts: './src/assets/fonts/**/*.*'
    },
    watch: {
        html: './src/*.html',
        js: './src/assets/js/**/*.*',
        style: './src/assets/style/**/*.*',
        img: './src/assets/img/**/*.*',
        fonts: './src/assets/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "livereload"
};

gulp.task('html', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(htmlmin({collapseWhitespace: true, conservativeCollapse: true, decodeEntities: true, html5: true, useShortDoctype: true, sortAttributes: true}))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

// todo: Выставить порядок подключения js скриптов
gulp.task('js', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style', function () {
    var sassStream = gulp.src(path.src.style.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(concat('sass.css'));

    var cssStream = gulp.src(path.src.style.css)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer('last 3 versions'))
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(concat('css.css'));

    var mergedStream = merge(sassStream, cssStream)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.style))
        .pipe(reload({stream: true}));

    return mergedStream;
});

gulp.task('image', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false}
            ],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html',
    'style',
    'image',
    'js',
    'fonts'
]);

gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html');
    });

    watch([path.watch.style], function (event, cb) {
        gulp.start('style');
    });

    watch([path.watch.img], function (event, cb) {
        gulp.start('image');
    });

    watch([path.watch.js], function (event, cb) {
        gulp.start('js');
    });

    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
