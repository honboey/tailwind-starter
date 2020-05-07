const {src, dest, watch, series, parallel} = require("gulp");

// css
const postcss = require("gulp-postcss")
const tailwind = require("tailwindcss")
const autoprefixer = require("autoprefixer");
const purgecss = require("gulp-purgecss");
const cleanCss = require("gulp-clean-css");

// html
const nunjucks = require("gulp-nunjucks-render");

// javscript
const terser = require("gulp-terser");

// images
const responsive = require("gulp-responsive");
const cache = require("gulp-cached");


/******************************************************
 * Tasks for development
 * Processes all files in /src and places them in /dev 
******************************************************/

// CSS processing – loads tailwind css file and adds browser compatibility prefixes
function css() {
    return src("src/styles/*.css")
    .pipe(postcss([tailwind(), autoprefixer()]))
    .pipe(dest("dev/styles"))
}

// HTML processing – compiles njk files and converts them to html
function html() {
    return src("src/templates/*.njk")
    .pipe(nunjucks({path: "src/templates/partials"}))
    .pipe(dest("dev"))
}

// Javascript processing – copies javascript files
function scripts() {
    return src("src/scripts/*.js")
    .pipe(dest("dev/scripts"))
}

// Font processing – copies font files
function typeface() {
    return src("src/styles/*.woff").pipe(dest("dev/styles/"))
}

/**************** 
* Image processing
****************/

// Image resizing for responsive images – this ignores any image which has the suffix "-lazy.jpg"
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

// Copies over the original images to /dev
function imageCopy() {
    return src("src/img/**/*.{jpg,png,gif}")
    .pipe(dest("dev/img"))
}

// Watchtasks
function watchTask() {
    watch(["src/styles/*.css"], parallel(css));
    watch(["src/templates/**/*.njk"], parallel(html));
    watch(["src/scripts/*.js"], parallel(scripts));
    watch(["src/img/**/*.{jpg,png,gif}"], parallel(images, imageCopy))
}

/******************************************************
 * Tasks for production
 * Processes all files in /dev and places them in /pub 
******************************************************/

// CSS processing – removes any unused CSS and uglifies / minimises
function cssProduction() {
    return src("dev/styles/*.css").
    pipe(purgecss({
        content: [
            "dev/*.html", "dev/scripts/*.js"
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

// HTML processing – copies over HTML files
function htmlProduction() {
    return src("dev/*.html")
    .pipe(dest("public"))
}

// Javascript processing – uglifies / minimises javascript
function scriptsProduction() {
    return src("dev/scripts/*.js")
    .pipe(terser())
    .pipe(dest("public/scripts"))
}

// Image processing – copies over images
function imgProduction() {
    return src("dev/img/**/*.{jpg,gif,png}")
    .pipe(dest("public/img/"))
}

// Font processing – copies over fonts
function typefaceProduction() {
    return src("dev/styles/*.woff")
    .pipe(dest("public/styles/"))
}

/******************************************************
 * Tasks 
******************************************************/

exports.css = css;
exports.html = html;
exports.scripts = scripts;
exports.images = images;
exports.watchTask = watchTask;
exports.cssProduction = cssProduction;

/******************************************************
 * Compound tasks
******************************************************/

exports.develop = parallel(watchTask, typeface);
exports.production = parallel(cssProduction, htmlProduction, scriptsProduction, imgProduction, typefaceProduction)
