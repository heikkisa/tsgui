tsgui
======

**tsgui** is a HTML5 Canvas based UI-framework designed especially for mobile devices. It is written in [TypeScript](http://www.typescriptlang.org/) but you can use it like a normal JavaScript library if you want to.

**This project is in an alpha stage and still somewhat experimental, so use at your own risk.**

See the demos and a simple home page example.

Installation
============

Make sure that [node.js](http://nodejs.org) and [Grunt](http://gruntjs.com) are installed and on the PATH and then type

```sh
npm install
```

to install all project dependencies. After that you can type

```sh
grunt
```

to build the library and samples. Check out the *samples*-directory and open any *.html*-file to view that sample in your browser.

When developing or hacking around you can use

```sh
grunt watch
```

to automatically monitor and build projects when you change any *.ts*-files associated with them. If you want to make a release use

```sh
grunt build
```

to build the final JavaScript-files into the *build*-directory. This also creates the declaraton file (*.d.ts) which you can use in your own TypeScript projects.

Documentation
=============

There is none! I'll plan to write some once (and if) the project gets more stable.
