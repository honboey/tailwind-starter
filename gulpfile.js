const {src, dest, watch, series, parallel} = require("gulp");
const postcss = require("gulp-postcss")
const tailwind = require("tailwindcss")
const autoprefixer = require("autoprefixer");
const nunjucks = require("gulp-nunjucks-render");
const purgecss = require("gulp-purgecss");
const cleanCss = require("gulp-clean-css");
const terser = require("gulp-terser");
const responsive = require("gulp-responsive");
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
    return src(["src/img/**/*.{jpg,png}", "!src/img/**/*-lazy.{jpg,png}"])
    // Only processes images which are new or changed
    .pipe(cache("imageResizing"))
    .pipe(responsive({
        "*" : [
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
        ],
        "**/*" : [
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
    },
    {   
        quality: 85,
        skipOnEnlargement: true,
        errorOnEnlargement: false
    }))
    .pipe(dest("dev/img"))
}

// Copies over the "-lazy.jpg" image to /dev
function lazyImageCopy() {
    return src("src/img/**/*-lazy.jpg")
    .pipe(dest("dev/img"))
}

// gulp-responsive doesn't recognise gifs so this copies over any gifs in the folder
function gifCopy() {
    return src("src/img/**/*.gif")
    .pipe(dest("dev/img"))
}

// Watchtasks
function watchTask() {
    watch([files.cssPathSrc], parallel(css));
    watch(["src/templates/**/*.njk"], parallel(html));
    watch([files.jsPathSrc], parallel(scripts));
    watch(["src/img/**/*.{jpg,png,gif}"], parallel(images, lazyImageCopy, gifCopy))
}

// Tasks for production
function cssProduction() {
    return src(files.cssPathDev).
    pipe(purgecss({
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
