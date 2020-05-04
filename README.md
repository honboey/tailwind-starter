# Tailwind Starter Kit
This is a repository that holds some common plugins, workflows and a file structure that is useful for starting a Tailwind project. It uses Gulp as the toolkit to automate the workflow.

## General workflow
All source files are placed in /src. When you run `gulp development` these files are processed and placed into /dev. The files in /dev can be read by your browser.

When development has finished a `gulp production` command runs a a series of scripts that processes all the /dev files and places them into /public. /public is the final, production ready site. 

## Common commands

### Development
`gulp development` processes and watches all /src files and puts them into /dev.

`gulp css` processes just .css files in /dev.
`gulp html` processes just .njk files in /src and converts them to .html and places them in /dev.
`gulp scripts` processes just .js files in /src and and places them in /dev.
`gulp watchTask` watches any changes in /src and runs the necessary script.

### Production
`gulp production` processes and watches all /dev files and puts them into /public.

`gulp cssProduction` processes just .css files in /dev/
