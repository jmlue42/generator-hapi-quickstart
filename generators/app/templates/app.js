var http = require('http'),
	https = require('https'),
	Hapi = require('hapi'),
	Joi = require('joi'),
	config = require('./config.json'),
	configSchema = require('./configSchema.js'),
	Authentication = require('./lib/helpers/authentication.js'),
	pkg = require('./package.json'),
	server,
	serverOptions;



Joi.validate(config, configSchema, function (err, value) {
		if (err) {
			throw new Error('Application config did not match the schema: ' + err);
		}
	}
);

var initRoutes = function (server) {
		var Controller, controller, connection;

		server.auth.scheme(Authentication.name, Authentication.scheme);
		server.auth.strategy('default', Authentication.name, true);

		for (var i = 0; i < config.controllers.length; i += 1) {
			Controller = require('./lib/controllers/' + config.controllers[i].file);
			controller = new Controller();
			if (controller) {
				connection = server.select(config.controllers[i].serverLabels);
				connection = connection.info ? connection : server;
				connection.route(controller.getRoutes());
			}
		}
	},

	registerPlugins = function (server) {
		var plugins = [
			{
				register: require('hapi-logger'),
				options: config.loggerOptions || {}
			},
			{
				register: require('hapi-swagger-json'),
				options:{
					apiVersion: pkg.version,
					info:{
						title: pkg.name,
						description: pkg.description,
						contact: 'contactEmail@domain.com' //TODO enter valid contact email
					}
				}
			}
		];

		server.register(plugins, function (err) {

			if (err) {
				return server.log(['error'], 'Error loading hapi plugins');
			}

			server.log(['info'], 'Successfully loaded all plugins');
		});
	},

	appStartUp = function () {

		http.globalAgent.maxSockets = config.maxSockets;
		https.globalAgent.maxSockets = config.maxSockets;

		serverOptions = {
			connections: {
				router: {
					isCaseSensitive: false
				},
				routes:{
					cors: {
						additionalHeaders: [
							'X-Requested-With',
							'X-Authorization',
							'Accept',
							'Origin',
							'Referer',
							'User-Agent',
							'Location',
							'DNT',
							'Cache-Control',
							'Keep-Alive',
							'If-Modified-Since',
							'Access-Control-Allow-Origin'
						],
						additionalExposedHeaders: [
							'Location',
							'Content-Range'
						]
					},
					security: {
						hsts: false,
						xframe: false,
						xss: false,
						noSniff: true,
						noOpen: true
					}
				}
			},
			debug: false
		};

		server = new Hapi.Server(serverOptions);

		for (var i = 0; i < config.servers.length; i += 1) {
			server.connection(config.servers[i]);
		}

		registerPlugins(server);
		initRoutes(server);

		return server;
	};


var app = appStartUp();
app.start(function () {
	console.log('Server running at:', server.info.uri);
});
