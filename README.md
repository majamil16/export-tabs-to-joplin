# Chrome Extension TypeScript Starter

[![Build Status](https://app.travis-ci.com/majamil16/export-tabs-to-joplin.svg?branch=master)](https://app.travis-ci.com/majamil16/export-tabs-to-joplin)

Chrome Extension, TypeScript and Visual Studio Code

## Prerequisites

* [node + npm](https://nodejs.org/) (Current Version)
* nvm - node 18.0

## Option

* [Visual Studio Code](https://code.visualstudio.com/)

## Includes the following

* TypeScript
* Webpack
* React
* Jest
* Example Code
  * Chrome Storage
  * Options Version 2
  * content script
  * count up badge number
  * background

## Project Structure

* src/typescript: TypeScript source files
* src/assets: static files
* dist: Chrome Extension directory
* dist/js: Generated JavaScript files

## Setup

```bash
npm install
```

## Import as Visual Studio Code project

...

## Build

```bash
npm run build
```

## Build in watch mode

### terminal

```bash
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Test

`npx jest` or `npm run test`

* helpful: [Travis CI Build Config Explorer
](https://config.travis-ci.com/explore)
