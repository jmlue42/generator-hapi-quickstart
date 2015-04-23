var generators = require('yeoman-generator'),
	yosay = require('yosay'),
	mkdirp = require('mkdirp');

var HapiQuickstartGenerator = generators.Base.extend({
	initializing: function () {
		this.pkg = require('../../package.json');
	},

	prompting: function () {
		var done = this.async();

		//Greetings
		this.log(yosay('Welcome to the Hapi QuickStart generator! A few quick questions and we\'ll have a project spun up for you in no time.'));

		var prompts = [
			{
				type: 'input',
				name: 'appName',
				message: 'What is the name of your app?',
				default: this.appname
			},
			{
				type: 'input',
				name: 'description',
				message: 'Please provide a brief description:'
			}
		];

		this.prompt(prompts, function (answers) {
			this.appName = answers.appName;
			this.description = answers.description;
			done();
		}.bind(this));
	},

	writing: function () {
		mkdirp.sync('lib/controllers');


		this.fs.copyTpl(
			this.templatePath('_README.md'),
			this.destinationPath('README.md'),
			{appName: this.appName, description: this.description}
		);
		this.fs.copyTpl(
			this.templatePath('_package.json'),
			this.destinationPath('package.json'),
			{appName: this.appName, description: this.description}
		);
		this.fs.copy(this.templatePath('Makefile'), this.destinationPath('Makefile'));
		this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
		this.fs.copy(this.templatePath('configSchema.js'), this.destinationPath('configSchema.js'));
		this.fs.copyTpl(
			this.templatePath('_config.json'),
			this.destinationPath('config.json'),
			{appName: this.appName}
		);
		this.fs.copy(this.templatePath('jshintReporter.js'), this.destinationPath('./test/jshint/reporter.js'));
		this.fs.copy(this.templatePath('jshintrc'), this.destinationPath('.jshintrc'));
		this.fs.copy(this.templatePath('app.js'), this.destinationPath('app.js'));
		this.fs.copy(this.templatePath('authentication.js'), this.destinationPath('./lib/helpers/authentication.js'));
	},

	install: function () {
		this.npmInstall();
	},

	end: function () {
		var allDone = 'All done! Next Steps:\n';
		allDone += '1. Run the \'hapi-quickstart:controller\' generator with an example payload to create routes.\n';

		this.log(yosay(allDone));
	}


});

module.exports = HapiQuickstartGenerator;