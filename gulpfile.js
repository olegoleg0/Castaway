//const gulp = require('gulp');
const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const gulpsourcemaps = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();
const {
    deleteAsync
} = require("@esm2cjs/del");
const ttfToWoff = require('gulp-ttf2woff');
const ttfToWoff2 = require('gulp-ttf2woff2');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');


function browserSync() {
    browsersync.init({
        server: {
            baseDir: 'src/'
        }
    });
}

function style(cb) {
    src(`./src/scss/style.scss`) 
        .pipe(gulpsourcemaps.init())
        .pipe((sass({ 
            outputStyle: 'compressed' 
        })))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: [
                'last 10 versions'
            ],
            grid: true
        }))
        .pipe(gulpsourcemaps.write(`./`))
        .pipe(dest(`./src/css/`))
        .pipe(browsersync.stream())
    cb();
}

function js(cb) {
    src([`./src/js/script.js`,
            `node_modules/bootstrap/dist/js/bootstrap.min.js`
        ])
        .pipe(concat('index.min.js'))
        .pipe(dest(`./src/js/`))
        .pipe(browsersync.stream())
    cb();
}

function watching(cb) {
    watch(`./src/scss/**/*.scss`, style);
    watch([`./src/js/**/*.js`, '!src/js/index.min.js'], js);
    watch(['src/**/*.html']).on('change', browsersync.reload);
}


function cleanDist() {
    return deleteAsync('dist');
}

function cleanImages() {
    return deleteAsync(`src/images/**/*.{jpg,png}`);
}



function imageMin(cb) {
    src(`src/images/**/*.*`)
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 95, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(webp())
    .pipe(dest(`src/images/`))

    cb()
}

function build() {
    return src([
            'src/images/**/*.*',
            'src/*.html',
            'src/fonts/*.*',
            'src/css/style.min.css',
            'src/js/*.min.js'
        ], {
            base: 'src/'
        })
        .pipe(dest('dist'))
}

function fontsConvert(cb) {
    src(`src/fonts/*.ttf`)
        .pipe(ttfToWoff())
        .pipe(dest(`src/fonts/`))
    src(`src/fonts/*.ttf`)
        .pipe(ttfToWoff2())
        .pipe(dest(`src/fonts/`))
    cb();
}

exports.style = style;
exports.js = js;
exports.sass = sass;
exports.cleanDist = cleanDist;
exports.fontsConvert = fontsConvert;
exports.imageMin = imageMin
exports.cleanImages = cleanImages; 

exports.default = parallel(style, js, browserSync, watching);

exports.build = series(cleanDist, build);


/* function style(cb) {
    src(`./src/scss/style.scss`) //беремо файл в цій директиві
        .pipe(gulpsourcemaps.init())
        .pipe((sass({ //за допомогою цієї магічної хуйні ми конвертуємо сас в сіесес
            outputStyle: 'compressed' //за допомогою цієї хуйні мініфікуємо 
        })))
        .pipe(concat('style.min.css')) //за допомогою цієї хуйні перезаписуємо назву 
        .pipe(autoprefixer({
            overrideBrowserslist: [
                'last 10 versions'
            ],
            grid: true
        }))
        .pipe(gulpsourcemaps.write(`./`))
        .pipe(dest(`./src/css/`)) //викидаємо файл в цю директиву
        .pipe(browsersync.stream())
    cb();
} */
/* gulp.src('src/image.jpg')
.pipe(webp())
.pipe(gulp.dest('dist')) */

//src(`src/images/compressed/**/*.{jpg,png}`)
    
//.pipe(dest(`src/images/compressedAndWebp`))