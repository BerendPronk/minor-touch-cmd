# Touch CMD
### Curriculum redesign of Communication and Multimedia Design
The online list, consisting of every project and course given yearly at the Communication and Multimedia Design study, needed a redesign. Not only that, the UX also needed to receive a boost, mainly because of a change in organisation the University, that provides the study, has though of making.  
A large multi-touch television was to be added to the events given at the University, like open days, where high-school students are looking for a study to follow. The contents of the already existing curriculum list needed to be translated to a new design, so the multi-touch television could be used to it's full potential during these events.

---

_<p align="center">Author note   
"This repository is about the finale of the minor Web Development I followed in 2017. It features an internal project within the university the minor was given at. Everything was thought of, designed, built and tested within the span of five weeks."</p>_

---

## Table of contents
- [General](#general)
  - [Core functionalities](#core-functionalities)
  - [Features](#features)
    - [Curriculum](#curriculum)
    - [Subterra](#subterra)
- [Technical details](#technical-details)
  - [Data model](#data-model)
  - [Architecture](#architecture)
  - [Style of code](#style-of-code)
    - [Consider comments](#consider-comments)
    - [JavaScript features](#javascript-features)
  - [Installation](#installation)
    - [NPM packages used](#npm-packages-used)
    - [First steps](#first-steps)
    - [Create environment variables](#create-environment-variables)
    - [Database setup](#database-setup)
      - [Adding the database with tables](#adding-the-database-with-tables)
    - [Add a media folder](#add-a-media-folder)
    - [Starting the application](#starting-the-application)
  - [Workflow](#workflow)
- [Feedback](#feedback)
- [License](#license)
- [For my personal assessment](#for-my-personal-assessment)
  - [Accomplishment](#accomplishment)
  - [Implemented courses](#implemented-courses)
    - [Web App from Scratch](#web-app-from-scratch)
    - [CSS to the Rescue](#css-to-the-rescue)
    - [Performance Matters](#performance-matters)
    - [Browser Technologies](#browser-technologies)
    - [Real-time Web](#real-time-web)
    - [Web of Things](#web-of-things)

---

## General
In this section of the README an overview of the application is given. First mentioning the functionalities the application needed to require, to follow up with a list of features that solved these design problems.

### Core functionalities
This application functions as a 'self-help' center during open days at every university that provides students with the Communication and Multimedia Design study. It was required to meet the following demands:

- The application must have a front-end view, for people to navigate through
- The application must be able to be viewed on a large multi-touch monitor, but also on desktop computers and mobile devices
- The application must feature the same experience on all screen sizes
- The application must inform the user with the core data of the yearly CMD program
- The application should be easily editable by an administrator
- Users of any age must be able to use the application for it's purpose, since this application is viewed on events with a variety of people attending (students, friends and entire families)
- The interface of the application must not contain interactions other than tap/click on the multi-touch monitor. While it's not prohibited for pages to scroll, it's nice to not have the user of the application experience any trouble

### Features
The application can be seen as two seperate systems, since the front-end view (Curriculum) is seperated very much from the content management system (Subterra). Because of that, the list of features will also be split into two parts.

#### Curriculum
- A new page navigation structure, instead of the existing list
- A clean navigation, featuring only the homepage and page-category
- A seperate `/tv` view for the multi-touch monitors, that enhances the page layout for a better reach of the user's arms
- Fully responsive layout, able to experience the inteded use of the application from the smallest phones to the largest multi-touch monitors 
- Integrated student work portfolio items
- A built-in FAQ page
- A button to edit content of page the administrator is on (if logged in)

#### Subterra 
- Dynamic pages; add/edit page content based on different fields (modules), which are; `heading`, `paragraph`, `image`, `list`, `embedded video` and `button`
- Dynamic page types; add/edit a page type and bind modules to be set as default, next time a page is added with that type.
- Dynamic menus; add/edit a menu and bind pages to it, to eventually set the menu to a page it needs to appear on
- Integrated portfolio; add/edit student work portfolio itmes to bind to pages with the page type `course`, `project`, or `internship`
- FAQ question add/edit
- Global database search; to be able to immediately find what's requested
- Image upload of any kind
- Advanced list controls; applied to modules and selection lists, to order or delete a given module/list item
- Encrypted administrator login

---

## Technical details
Time to dive into the more technical aspect of the application. Everything that's necessary to know before working on this project will be discussed here, starting with structure and flow, eventually reaching the installation process and code styles.

### Data model
_intro to be added_

_translation image of table-structure to be added_

### Architecture
_intro to be added_

_relation of front-end with back-end image to be added_

### Style of code
Before being able to work on this project yourself, you need to understand what you're allowed to do, and what your restrictions are, which are as follows:

- No Gulp / Grunt
- No npm scripts (other than to launch the application)
- No code minification / mangle
- No CSS preprocessor
- No autoprefixing

So how can you possibly develop for this project, you ask? Just with vanilla HTML, CSS and object-oriented JavaScript (ES6) code. It's also important to mention that you should use spaces, instead of tabs.

#### Consider comments
Everyone has their own way manner to code, and that's fine. In order to help others understand your part, try to comment on everything that might become unclear to someone else working on the project.

#### JavaScript features
When adding a new client-side feature to either Subterra or the front-end, you should apply the following style:

```javascript
/* /script/modules/feature.js */

// Feature name and explanation
const feature = (() => {

  const random = Math.random();

  const one = () => {
    return 'First method';
  };
  
  const two = () => {
    return random;
  };
  
  // Only return functions to be used as method of this feature
  return {
    one: one,
    two: two 
  }

})();
```

```javascript
/* /script/anyfile.js */

// Returns 'First method'
feature.one();

// Returns 0.3637241349928162
feature.two();
```

### Installation
The following instructions are all that is necessary to install and run this application on your own device.

#### NPM packages used
The application runs on Node.js with the following npm packages, all of which are `dependencies`, no `dev-devendencies` are installed.

|Package|Version|
|---|--:|
|[`body-parser`](https://www.npmjs.com/package/body-parser)|^1.17.2|
|[`compression`](https://www.npmjs.com/package/compression)|^1.6.2|
|[`debug`](https://www.npmjs.com/package/debug)|^2.6.8|
|[`dotenv`](https://www.npmjs.com/package/dotenv)|^4.0.0|
|[`ejs`](https://www.npmjs.com/package/ejs)|^2.5.6|
|[`express`](https://www.npmjs.com/package/express)|^4.15.3|
|[`express-myconnection`](https://www.npmjs.com/package/express-myconnection)|^1.0.4|
|[`express-session`](https://www.npmjs.com/package/express-session)|^1.15.3|
|[`multer`](https://www.npmjs.com/package/multer)|^1.3.0|
|[`mysql`](https://www.npmjs.com/package/mysql)|^2.13.0|


#### First steps
```shell
$ git clone https://github.com/BerendPronk/minor-touch-cmd.git

$ cd minor-touch-cmd

$ npm install
```

#### Create environment variables
Before being able to run this application, you should create an `.env` file first, which needs to be filled with the following variables.  
**Note: The value of each variable refers to the type of the value you should enter.**
```
DB_HOST=string
DB_USERNAME=string
DB_PASSWORD=string
DB_DATABASE=string
DB_PORT=number

CRYPTO_KEY=number

SESSION_SECRET=string
```

#### Database setup
Run the following SQL-queries all at once to setup a database and to create the required tables. Each table has it's column-properties already defined within this query, so there's nothing to worry about.  
**Note: The name of the database doesn't necessarily have to be `touch-cmd`, as long as it matches with the `DB_DATABASE` variable in your `.env` file.  
The name of the tables themselves are predefined and should not be altered.**

##### Adding the database with tables
```sql
CREATE DATABASE `touch-cmd` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `touch-cmd`;

CREATE TABLE `faq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` text,
  `answer` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

CREATE TABLE `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `children` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;

CREATE TABLE `modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `title` varchar(45) DEFAULT NULL,
  `menus` varchar(255) DEFAULT NULL,
  `content` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8;

CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) DEFAULT NULL,
  `courses` text,
  `paragraph` text,
  `image` text,
  `video` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;

CREATE TABLE `types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `defaultModules` text,
  `isCategory` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
```

#### Add a media folder
The next step is to add a folder that'll contain all image uploads from the content management system. Do this via the graphical user interface of you OS, or by typing the next command in your terminal.

```shell
$ mkdir media
```

#### Starting the application
All that's left is to start the application.

```shell
$ npm start
```

### Workflow
To develop for this application, there is not a set of tools required. You are free to use whatever you desire, as long as you take in mind the previously mentioned [Style of code](#style-of-code).

The entirety of this project was built with the following set of tools:
- Shell: [Hyper](https://github.com/zeit/hyper), with [Oh My Zsh](https://github.com/robbyrussell/oh-my-zsh) installed
- Text editor: [Atom](https://atom.io/)
- Database design: [MySQL Workbench](https://www.mysql.com/products/workbench/)
- Browser: [Google Chrome](https://www.google.com/chrome/browser/desktop/)

---

## Feedback
If you happen to notice any flaw on my part, feel free to notify me by creating an issue on this repository. Pull request are very much appreciated as well.

## License
[MIT](https://github.com/BerendPronk/minor-touch-cmd/blob/master/LICENSE)

Copyright - Berend Pronk

2017

---

## For my personal assessment
This project was made to finish the minor Web Development I followed in the third year of my Communication and Multimedia Design study. This section of the README was essential, but my intentions are not to break the reading experience for the average passerby. That's why I've put it at the bottom. Everyone is allowed to read this, of course, but there might be some included terms that some won't understand.

### Accomplishment
Subterra, the content management system I created is the aspect I'm most proud of. Mainly because I've always wanted to create a system that achieves what Subterra currently does, except in PHP. This was before I started my Communication and Multimedia Design study, so I didn't know about other technologies. With everything that I've learned with Node.js, and JavaScript in general, I was finally able to build a content management system to my liking, and for a good cause as well!
I've managed to develop it in such a way, that my fellow developers only have to run a simple command in their shell to implement Subterra.

```shell
$ npm install subterra
```

Only to finish the implementation by configuring it, and binding Subterra to the main application

```javascript
// Setup application
const express = require('express');
const app = express();

// Require Subterra
const subterra = require('subterra');

// Configure Subterra
subterra.config(app);
```

### Implemented courses
I conducted a short list of the courses I followed during the minor, and how this application relates to the topics discussed during class. I won't explain what these topics were, since my assessors know these by default.

#### Web App from Scratch
Though I don't make any requests to external API's (since that wouldn't fit the objective I was given), I do make a lot of requests to a exclusive (to this application) MySQL database. The data I receive from these calls, are manipulated if necessary, and translated to usable data types to be included in the DOM via EJS.  
The JavaScript of client-side Subterra is object-oriented. See [JavaScript features](#javascript-features) for a quick reference to layout.

#### CSS to the Rescue
I do not use a preprocessor and tried to make use of the cascading properties that CSS has to offer. Everything is styled in a mobile viewport at first, to be eventually scaled to larger viewports, tweaking the styling along the way.  
All transitions and animations are only applied on properties that are able to render 60FPS animations at all times (`transform` and `opacity`).

The stylesheets I made also contain little to no classnames.

#### Performance Matters
A lot of the taught principles within performance optimization were implemented in this project. Images are either SVG-files, or downsized in size as much as possible, while still containing sharp visual quality.  
The application uses a very small amount of client-side JavaScript, the rest is rendered server-side. A ServiceWorker is installed to cache pages and assets, and for offline support.

#### Browser Technologies
The application — that includes the Subterra content management system — works on every size of screen and is structured in a logical sense, in order for keyboard users and the blind to navigate the page with ease, without jumping to irrelevance to break to flow. Feature detection is applied to the client-side JavaScript code, so older browsers, that don't have any support for a ServiceWorker, won't break on undefined code.

#### Real-time Web
I tried to implement this course in the mix, though I couldn't find an effective use case for the technology within this project.

#### Web of Things
I wanted this course to be featured in the application so bad. My idea was to setup a HC-SR04 (Ultrasonic Distance) sensor underneath the Samsung Touch table, to check if someone is standing in front of the device, every thirty seconds. After a minute and a half, three checks; if there still wouldn't be a person detected, the interface would automatically navigate back to the homepage, to prevent new users from getting lost in the page structure the application has.
However, I came to find that the NodeMCU-chips no longer support any use for the sensor with the officially available firmware. I have found an alternative version, one that should've worked with the sensor, except that version didn't have websockets built in. Websockets were crucial in sending a message to the server, telling the interface to navigate to the homepage.  
I unfortunately lost a day's worth of work coming to this conclusion.

Fin.
