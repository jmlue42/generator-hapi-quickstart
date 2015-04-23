var Joi = require('joi'),
	schema = Joi.object({
		loggerOptions: Joi.object({
			name: Joi.string(),
			src: Joi.boolean(),
			tags: Joi.array().items(Joi.string()),
			transport: Joi.string().valid(['file', 'console']),
			logFilePath: Joi.string().when('transport', {
				is: 'file',
				then: Joi.string().min(1).required(),
				otherwise: Joi.any().forbidden()
			})
		}),
		servers: Joi.array().items(
			Joi.object({
				port: Joi.number().integer().required(),
				labels: Joi.array().items(Joi.string()),
				host: Joi.string()
			})
		).required(),
		maxSockets: Joi.number().integer().required(),
		controllers: Joi.array().items(
			Joi.object({
				file: Joi.string().required(),
				serverLabels: Joi.array().unique().items(Joi.string())
			})
		).required()
	});

module.exports = schema;
