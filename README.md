# Tailwind Starter Kit
This is a repository that holds some common plugins, workflows and a file structure that is useful for starting a Tailwind project. It uses Gulp as the toolkit to automate the workflow.

## General workflow
All source files are placed in [/src](/src). When you run `gulp develop` these files are processed and placed into [/dev](/dev). The files in [/dev](/dev) can be read by your browser.

Out of the box, `gulp develop` does several things:
* Converts the original tailwind.css file to a browser-legible .css file.
* Adds any necessary browser prefixes to the .css file so it is compatible on all browsers
* Converts and collates the .njk files to browser-legible .html files
* Copies any javascript files
* Copies any fonts

When development has finished a `gulp production` command runs a a series of scripts that processes all the [/dev](/dev) files and places them into [/public](/public). [/public](/public) is the final, production ready site. 

`gulp production` does several things to get the files production ready:
* Runs PurgeCSS to get rid on any unwanted css 
* Minimises CSS to make it as lean as possible
* Copies any javascript files
* Copies any fonts
* Copies any images

## Directory tree and file structure
The directory tree looks like this
```
src (this holds all source files)
    – img
    – scripts
    – styles
    – templates (this holds .njk files which correspond to its .html page)
        – partials (this holds the .html templating blocks)
    
dev (this holds all development files)
    – img
    – scripts
    – styles
    
public (this is production ready code)
    – img
    – scripts
    – styles 
```

## Geting started
These instructions are for getting the project running on a local development environment.

### System requirements
* [NodeJS v12.16.3](https://nodejs.org)
* [Gulp](https://gulpjs.com/)

### Install plugins 
Install all the necessary plug-ins by running `npm install gulp-postcss tailwindcss autoprefixer gulp-nunjucks-render gulp-purgecss gulp-clean-css gulp-terser --save-dev`

### Run your first build
`gulp develop`

## Common commands

### Development
* `gulp development` processes and watches all [/src](/src) files and puts them into [/dev](/dev).

   * `gulp css` processes .css files in [/dev](/dev).
   * `gulp html` processes .njk files in [/src](/src) and converts them to .html and places them in [/dev](/dev).
   * `gulp scripts` processes .js files in [/src](/src) and and places them in [/dev](/dev).
   * `gulp watchTask` watches any changes in [/src](/src) and runs the necessary script.

### Production
* `gulp production` processes and watches all [/dev](/dev) files and puts them into [/public](/public).

   * `gulp cssProduction` processes .css files in [/dev](/dev).
   * `gulp scriptsProduction` uglifies all .js files in [/dev](/dev)

## Optional plug-ins
There is another branch of this project called 'optionals'. This branch contains the following optional plugins:
* [SwupJS](https://swup.js.org/) for animated page transitions
* [gulp-responsive](https://www.npmjs.com/package/gulp-responsive) for making multiple resolutions of images
* [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin) for minimising image size
* [LazySizes](https://github.com/aFarkas/lazysizes) for lazy loading images


