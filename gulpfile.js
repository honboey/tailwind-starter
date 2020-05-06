const {src, dest, watch, series, parallel} = require("gulp");
const postcss = require("gulp-postcss")
const tailwind = require("tailwindcss")
const autoprefixer = require("autoprefixer");
const nunjucks = require("gulp-nunjucks-render");
const purgecss = require("gulp-purgecss");
const cleanCss = require("gulp-clean-css");
const terser = require("gulp-terser");
const responsive = require("gulp-responsive");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cached");

// File paths
const files = {
    // src
    htmlPathSrc: "src/templates/*.njk",
    cssPathSrc: "src/styles/*.css",
    jsPathSrc: "src/scripts/*.js",
    // dev
    htmlPathDev: "dev/*.html",
    cssPathDev: "dev/styles/*.css",
    jsPathDev: "dev/scripts/*.js"
}

// Tasks for development
function css() {
    return src(files.cssPathSrc)
    .pipe(postcss([tailwind(), autoprefixer()]))
    .pipe(dest("dev/styles"))
}

function html() {
    return src(files.htmlPathSrc)
    .pipe(nunjucks({path: "src/templates/partials"}))
    .pipe(dest("dev"))
}

function scripts() {
    return src(files.jsPathSrc)
    .pipe(dest("dev/scripts"))
}

function typeface() {
    return src("src/styles/*.woff").pipe(dest("dev/styles/"))
}

// This creates multiple sizes for any .jpg image in /src/img. It ignores any image which has the suffix "-lazy.jpg"
function images() {
    return src(["src/img/**/*.jpg", "!src/img/**/*-lazy.jpg"])
    .pipe(cache("imageResizing"))
    .pipe(responsive({
        "*.jpg" : [
            {
                width: 800,
                rename: {suffix: "-800w"}
            }, {
                width: 1080,
                rename: {suffix: "-1080w"}
            }, {
                width: 1440,
                rename: {suffix: "-1440w"}
            }, {
                width: 2000
            }
        ]
    }))
    .pipe(imagemin())
    .pipe(dest("dev/img"))
}

// Copies over the "-lazy.jpg" image to /dev
function lazyImageCopy() {
    return src("src/img/**/*-lazy.jpg")
    .pipe(dest("dev/img"))
}

// Watchtasks
function watchTask() {
    watch([files.cssPathSrc], parallel(css));
    watch(["src/templates/**/*.njk"], parallel(html));
    watch([files.jsPathSrc], parallel(scripts));
    watch(["src/img/**/*.jpg"], parallel(images))
    watch(["src/img/**/*.jpg"], parallel(lazyImageCopy))
}

// Tasks for production
function cssProduction() {
    return src(files.cssPathDev).pipe(purgecss({
        content: [
            files.htmlPathDev, files.jsPathDev
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }))
    .pipe(cleanCss({
        debug: true
    }, (details) => {
        console.log(details.name + " was " + details.stats.originalSize / 100 + " bytes");
        console.log(details.name + " is now " + details.stats.minifiedSize / 100 + " bytes");
    })).pipe(dest("public/styles"))
}

function htmlProduction() {
    return src(files.htmlPathDev)
    .pipe(dest("public"))
}

function scriptsProduction() {
    return src(files.jsPathDev)
    .pipe(terser())
    .pipe(dest("public/scripts"))
}

function imgProduction() {
    return src("dev/img/**/*.{jpg,gif,png}")
    .pipe(dest("public/img/"))
}

function typefaceProduction() {
    return src("dev/styles/*.woff")
    .pipe(dest("public/styles/"))
}

// Task calling
exports.css = css;
exports.html = html;
exports.scripts = scripts;
exports.images = images;
exports.watchTask = watchTask;
exports.cssProduction = cssProduction;

// Combo task calling
exports.develop = parallel(watchTask, typeface);
exports.production = parallel(cssProduction, htmlProduction, scriptsProduction, imgProduction, typefaceProduction)
