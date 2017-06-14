# Touch CMD
This README is a living document until the final delivery on friday, june 30th. By then this README will have been expanded on it's current state. 

## Installation
The following instructions are all that is necessary for the final product. However, the database section of this README has not been written, or even thought of, yet.

```shell
$ git clone https://github.com/BerendPronk/minor-touch-cmd.git

$ cd minor-touch-cmd

$ npm install
```

Before being able to run this application, you should create an `.env` file first, which needs to be filled with these variables:
```
DB_HOST=string
DB_USERNAME=string
DB_PASSWORD=string
DB_DATABASE=string
DB_PORT=number

SESSION_SECRET=string
```

*~(database)~*

All that is left is to start the application

```shell
$ npm start
```

## Goals
What do I want to achieve with this project, exactly? It's listed here:

- Build a unique experience for a large touchscreen interface
- Build a clean content management system in NodeJS, that'll be named Subterra

## Objectives
Before being able to create such a platform, I need to figure out what my priorities should be. The next lists consist of objective I still need to work on. Everything that's already been made, exists as files on this repository.
My development process is best checked in the [issues page](https://github.com/BerendPronk/minor-touch-cmd/issues) of this project.

### Primary objectives
- **[Front-end]** Add page view templating
- **[Front-end]** Add styling to page views
- **[Front-end]** Implement page transitions
- **[Subterra]** Add content via the content management system
- **[Subterra]** Implement FAQ in subterra and link dataflow with page views
- **[Misc]** Choose between functional or object-oriented programming for client-side scripts
- **[Misc]** Performance check + fix
- **[Misc]** Refactor code
- **[Misc]** Expand this README

### Secondary objectives
- **[General]** Replace ID-based (`/minor/1`) routing to slug-based routing (`/minor/web-development`)
- **[Subterra]** Style content management system
- **[Subterra]** Encrypt/decrypt user data ;)
- **[IOT]** Implement NodeMCU into the mix, doesn't have to be a major feature

## Core functionalities
This application will function as a 'self-help' center during open days at every university that provides students with the Communication and Multimedia Design study. It needs to meet the following demands:
- The application must have a front-end view, for people to navigate through
- The application must be viewed on a large multi-touch monitor, desktop computers and mobile devices
- The application must inform the user with the core data about the CMD program
- The application should be easily editable by an administrator
- Users of any age must be able to use the application for it's purpose
- The interface of the application must not contain interactions other than tap/click
