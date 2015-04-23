var path = require('path'),
	jsBeautifier = require('js-beautify'),
	inflection = require('inflection'),
	generators = require('yeoman-generator'),
	glob = require('glob'),
	fs = require('fs'),
	_ = require('lodash'),
	yosay = require('yosay');

var ControllerGenerator = generators.NamedBase.extend({
	initializing: function () {
		this.log(yosay('Welcome to the Hapi QuickStart Controller subgenerator! We\'re going to be generating a \'' + this.name + '\' controller...'));
		this.defaultControllerName = this.name;

		glob(this.name + '.json', function (err, files) {
			if (!err && files && files.length > 0) {
				this.defaultResourceModelFile = files[0];
			}
			else {
				this.defaultResourceModelFile = '';
			}
		}.bind(this));
	},

	prompting: function () {
		var done = this.async();

		var prompts = [
			{
				type: 'input',
				name: 'resourceModelFile',
				message: 'What is the location to the .json file that represents the resource to create routes for, relative to the current directory?',
				default: this.defaultResourceModelFile,
				required: true
			},
			{
				type: 'input',
				name: 'resourceName',
				message: 'What is name of this resource?',
				default: this.name,
				required: true
			},
			{
				type: 'input',
				name: 'idPropName',
				message: 'What is name of the property that uniquely identifies this resource?',
				default: 'id'
			}
		];

		this.prompt(prompts, function (answers) {
			if (fs.existsSync(answers.resourceModelFile)) {
				this.resourceModelFile = answers.resourceModelFile;
			}
			else if (fs.existsSync(path.join(process.cwd(), answers.resourceModelFile))) {
				this.resourceModelFile = path.join(process.cwd(), answers.resourceModelFile);
			}
			else {

				this.emit('error', new Error('Unable to locate file: ' + answers.resourceModelFile))
			}

			this.idPropName = answers.idPropName;
			this.resourceName = answers.resourceName;
			this.pluralResourceName = inflection.pluralize(answers.resourceName);

			this.controllerName = (this.defaultControllerName.indexOf('Controller') > -1) ? answers.controllerName : answers.controllerName + 'Controller';

			done();
		}.bind(this));
	},

	writing: function () {
		this.controllerName = this.name.substr(0, 1).toUpperCase() + this.name.substr(1) + 'Controller';
		this.fs.copyTpl(
			this.templatePath('_controller.js'),
			this.destinationPath('./lib/controllers/' + this.name + 'Controller.js.txt'),
			{
				controllerName: this.controllerName,
				pluralResourceName: this.pluralResourceName,
				idPropName: this.idPropName,
				resourceName: this.resourceName,
				idPropType: this.idPropType,
				resourceProps: this.resourceProps,
				getRandom: this.getRandom
			}
		);
		this.fs.write(path.join(process.cwd(), '/lib/controllers/' + this.name + 'Controller.js'),
			jsBeautifier(this.read(path.join(process.cwd(), '/lib/controllers/' + this.name + 'Controller.js.txt')), {
				'indent_char': '\t',
				'indent_size': 1
			}));
		this.fs.delete(path.join(process.cwd(), '/lib/controllers/' + this.name + 'Controller.js.txt'));
		this.fs.copyTpl(
			this.templatePath('_controller.unit.tests.js'),
			this.destinationPath('./test/unit/' + this.name + 'Controller.tests.js'),
			{
				name: this.name
			}
		);
	},

	end: function () {
		var allDone = 'All done! Next Steps:\n';
		allDone += '1. Add actual authentication logic to /helpers/authentication.js\n';
		allDone += '2. Verify/Edit validate and response config sections on each route to match your api contract and to increase swagger accuracy. \n';
		allDone += '3. Replace current route handler functionality with real implementation.\n';
		allDone += '4. Customize as needed and enjoy!';

		this.log(yosay(allDone));
	}
});

ControllerGenerator.prototype.parseModel = function () {
	var model = this.resourceModel = this.fs.readJSON(this.resourceModelFile);

	var getTypeString = function (val) {
			var typeString;
			switch (typeof(val)) {
				case 'object':
					typeString = (val === null) ? null : (_.isArray(val)) ? 'array' : 'object';
					break;
				case 'number':
					typeString = (val % 1 === 0) ? 'integer' : 'number';
					break;
				case 'undefined':
					typeString = null;
					break;
				default:
					typeString = typeof(val);
			}
			return typeString;
		},
		getRandomValueOfType = this.getRandom = function (typeString) {
			var ret, randStr = Math.random().toString(36).substring(7);
			switch (typeString) {
				case 'string':
					ret = randStr;
					break;
				case 'number':
				case 'integer':
					ret = Math.round(Math.random() * 6784123);
					break;
				case 'boolean':
					ret = (Math.random() >= 0.5);
					break;
				case 'array':
					ret = randStr.split('');
					break;
				case 'object':
					ret = _.object(randStr.split(''), _.shuffle(randStr.split('')));
					break;
				default:
					ret = null;
			}
			return ret;
		};

	var props = this.resourceProps = [];
	this.idPropType = getTypeString(this.resourceModel[this.idPropName]);

	if (!this.resourceModel.hasOwnProperty(this.idPropName)) {
		this.emit('error', new Error('Unable to locate property "' + this.idPropName + '" on the resource provided!'));
	}


	var getProps = function (value, key) {
		var type = getTypeString(value),
			prop;
		if (type === 'object') {
			prop = {
				propName: key || undefined,
				propType: type,
				contains: []
			};

			_.forOwn(value, function (value, key) {
				prop.contains.push(getProps(value, key));
			});
		} else if (type === 'array') {
			prop = {
				propName: key || undefined,
				propType: type,
				contains: []
			};

			var subType = getTypeString(value[0]);
			if (subType === 'object' || subType === 'array') {
				prop.contains.push({propType: subType, contains: []});
				_.forOwn(value[0], function (value, key) {
					prop.contains[0].contains.push(getProps(value, key));
				});
			} else {
				prop.contains.push({propType: subType});
			}

		} else {
			prop = {
				propName: key || undefined,
				propType: type
			};
		}

		return prop;
	};

	_.forOwn(model, function (value, key) {
		props.push(getProps(value, key));
	});
};

ControllerGenerator.prototype.injectController = function () {
	var configFile = this.fs.readJSON(path.join(process.cwd(), 'config.json'));

	if (!(_.isArray(configFile.controllers))) {
		this.emit('error', new Error('Please ensure that the controllers property in config.json is an Array'));
	}

	if (_.findWhere(configFile.controllers, {file: this.name + 'Controller.js'})) {
		this.emit('error', new Error('A controller with this name already exists!'));
	}

	configFile.controllers.push({
		file: this.name + 'Controller.js'
		//TODO: add labels
	});

	this.fs.write(path.join(process.cwd(), 'config.json'), jsBeautifier(JSON.stringify(configFile), {
		'indent_char': '\t',
		'indent_size': 1
	}));
};

module.exports = ControllerGenerator;