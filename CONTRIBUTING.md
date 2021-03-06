Contributing to jqfactory
=========================
- Take care to maintain the existing coding style. 
- Add Jasmine unit tests for any new or changed functionality. 
- Lint and test your code using [grunt](https://github.com/cowboy/grunt).

If you plan to contribute to jqfactory in the future, keep in mind that you 
should make sure your code **passes the Grunt checks**.  This requires having a
complete build environment as detailed below.

After you have verified your code, send a pull request to the **jqfactory dev 
branch**.  After you send a pull request, you will hear back from me shortly after 
I review your code.

You'll find source code in the 'src' subdirectory.

## Unit Tests
All unit tests are written using the [Jasmine](http://pivotal.github.com/jasmine/) Framework.  
See the linked pages for a great introduction.

## Setting up the jqfactory build environment

_Note_ that you don't actually need to do a build to use jqfactory... you can 
just uses the JS code as-is.  These instructions exist for developers and anyone 
who wants to delve into the code.

If you just want to use jqfactory, then visit the [jqfactory ReadMe](https://github.com/gfranko/jqfactory/blob/master/README.markdown) 
on GitHub.

### Developer tools

SelectBoxIt uses the following development tools:

   - [Node.js](http://nodejs.org): For package management and builds.

   - [Grunt](http://gruntjs.com): to run the build script.

   - [Jasmine](http://pivotal.github.com/jasmine/): unit testing framework.

   - [PhantomJS](http://phantomjs.org): headless WebKit browser for testing.

### Setting up the developement environment

1. Install Node.js.  Luckily the [Node web site](http://nodejs.org) makes this 
   fairly straightforward, with installers for the major platforms.

2. Install Grunt as detailed on the [Grunt 'getting started' page]:
    
          npm install -g grunt-cli
3. Perform the core dependency installations by navigating to the root of your
   SelectBoxIt source tree and typing the following on the command line:
    
          npm install
**Note:** If you are on Windows, remember you need to run the grunt command 
using `grunt.cmd`.

4. Install PhantomJS from its [home page](http://phantomjs.org).  This means 
   downloading the appropriate file, uncompressing it, and then copying the 
   `phantomjs` file to a location in your path.  On MacOSX, this looks 
   _something_ like the following after downloading:

          cd /usr/local/bin
          sudo cp ~/Downloads/phantomjs-1.8.1-macosx/bin/phantomjs .

That's it!  You should now be set up to edit and test jqfactory.

**Contributors**

Greg Franko - [@gfranko](https://github.com/gfranko)

## License
Copyright (c) 2013 Greg Franko  
Licensed under the MIT license.
