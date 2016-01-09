# generator-hapi-quickstart

> A [yeoman](http://yeoman.io/index.html) generator to spin up a [hapi.js](http://hapijs.com) api project


## What is this?

If you haven't used Yeoman before, it may be helpful to read up on it a bit. Essentially, this generator will create the basic structure and functionality for a set of RESTful services on a webserver written in NodeJS using the hapi framework. Here are some of the benefits to using this generator:

* Code is structured and built in clean, clear and manageable manner.
* Easy CRUD route generation
* Code coverage tools included
* Basic parameter validation on routes
* Basic Response validation on routes
* Logging mechanism setup to work with hapi's native server.log() and response.log() functionality
* Mocha.js unit test setup
* JSHint setup
* CORS headers implemented
* Stubbed out authentication helper that can easily be overridden
* Config schema validation


## Getting Started
- Make sure you have [yo](https://github.com/yeoman/yo) installed: `$ sudo npm install -g yo`
- Clone this repository, then `$ npm install`
- Register this generator globally `$npm link`, once this project is added to npm, standard npm install methods will work.

Once you have the above dependencies installed, create a new folder where your app will live, `cd` into it and run the following command:

```
$ yo hapi-quickstart
```

This will prompt you for some data about the app you wish to create, and then produce the basic structure of a hapi NodeJS app but without any controllers/routes. By default, the app will listen on port 3000 (this is configurable in `config.json`).


### Sub Generators

The following sub generators are available to help stub out controllers and routes for the application you just generated:

#### controller

First, let's try to add some routes and a controller via the controller sub generator. The controller sub generator creates CRUD routes for a given resource. In order to run this sub generator, we first have to create a JSON file that contains the representation of the resource. For example let's create a blog. Create the following JSON file in the root of your app directory (you can delete this file after generating the routes if you'd like):

```json
{
	"id": "",
	"author": "me",
	"isShared": false,
	"text": "some text"
}
```
The actual values of each property are only needed to parse out the type that each property should be, otherwise the values are completely arbitrary. Let's name it `blog.json` because the controller sub generator will search your app directory for the name of the file based on the name you pass to the sub generator. If you didn't name it `blog.json`, that's ok. The route sub generator will prompt you for the location where your JSON file lives if it can't find it by name.

Now let's run the controller sub generator:

```
$ yo hapi-quickstart:controller blog
```

If you named the JSON file `blog.json` you should be able to just hit ENTER at each prompt and use the default that the sub generator is trying to use. Reading through the prompts, you can see that you have some flexibility on what your resource name and unique identifier are and which controller to add the routes to. This sub generator will also prompt you to overwrite some files with the changes it wants to make. Feel free to type `y` to overwrite these files when prompted.

The controller above will also create `blogController.js` in the `./lib/controllers` directory.

Now, when you run the app, you should be able to hit your routes.

```
$ node app.js
```

The routes that were created are simulating CRUD operations on your new resource. It's up to you now to swap that out with your own implementation.


## Structure of the Generated Project

You now have a base hapi.js project generated, so let's go over where everything is...

### Project Root

In your project root you will find the following files:

* README.md - Your application's documentation page. At this point its only stubbed out with your project name. Update with pertinent information and repo location.
* package.json - Your npm setup file. Update this with any missing info such as contributors, keywords, additional dependencies, etc..
* Makefile - aliased tasks to help run things like test triggers and project installs
* configSchema.js - [Joi](https://github.com/hapijs/joi) validation object for verifying the application config file. This only needs to updated if you wish to change the application config template.
* config.json - The global application config. Where:
	* `loggerOptions` - Options object for the [hapi-logger](https://github.com/mac-/hapi-logger) plugin
	* `servers` - Object array of server ports to listen on. Currently should only contain one server object.  Where:
		* `port` - Port to listen on.
		* `host` - Optional value for explicitly naming the server host. Localhost is default for most systems.
		* `labels` - Optional string array for labeling the server connection.
	* `controllers` - string array of controller files to load into server connection.
* app.js - Application entry point. This file checks config file structure, initializes authentication strategies and routes, and installs plugins as requested. 
* .gitignore - git ignore file
* .jshintrc - initial jshint config file. Update based on team style.

### ./lib/helpers

Generally used to place non-controller files.

* authentication.js - Default authentication strategy, it will initially be setup to validate against tokens in the 'authorization' header of the request.

### ./lib/controllers

Controllers/Route Implementations. Generated Controllers will be decorated with TODO comments in areas where user attention may be needed initially such as request/response validation and swagger annotations. See [hapi.js](http://hapijs.com/api) for further details on controller structure and [hapi-swagger-json](https://github.com/jmlue42/hapi-swagger-json) for further details on swagger annotations.

### ./test

#### /jshint

Jshint reporter to output jshint errors/warning with line output to more easily find location of error.

#### /unit

Mocha unit test files. See [mocha.js](http://mochajs.org/) for details on test structure and options. Tests can be run via `make test`, `make test-html`, `npm test` or `npm test-html`.

## Contributing

In lieu of a formal style guide: 

* Take care to maintain the existing coding style. 

## Version Compatibility

### Currently compatible with: Hapi 8.x.x

* 1.x.x - Hapi 8.x.x

## License

MIT
