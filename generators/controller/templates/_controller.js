var Joi = require('joi'),
	Boom = require('boom');

<%

var randomData = getRandom;

function buildHandlerResponse(resourceProps){
	var response = {};
	resourceProps.forEach(function(item, index){
		addProperty(item, response);
	});
	return response;
}

function addProperty(prop, o){
	switch(prop.propType){
		case 'object':
			o[prop.propName] = {};
			prop.contains.forEach(function(item, index){
				addProperty(item, o[prop.propName]);
			});
			break;
		case 'array':
			o[prop.propName] = [];
			prop.contains.forEach(function(item, index){
				if(item.propType === 'object'){
					o[prop.propName].push({});
					item.contains.forEach(function(item, index){
						addProperty(item, o[prop.propName][o[prop.propName].length-1]);
					});
				} else if (item.propType === 'array'){
					o[prop.propName].push([]);
					item.contains.forEach(function(item, index){
						addProperty(item, o[prop.propName][o[prop.propName].length-1]);
					});
				} else {
					o[prop.propName].push(randomData(item.propType));
				}
			});
			break;
		default:
			o[prop.propName] = randomData(prop.propType);
	}
}

function buildResponseScheme(resourceProps, idPropName){
	var scheme = 'Joi.object({';

	resourceProps.forEach(function(item, index){
		if(idPropName && (item.propName === idPropName)){ return; }
		scheme = addJoiProperty(item, scheme);
	});
	scheme = scheme.replace(/,$/, '');
	scheme += '})';
	return scheme;
}

function addJoiProperty(prop, str){
	var joiParts = {
		joi: 'Joi',
		objStart: '.object({',
		objEnd: '})',
		req: '.required()',
		num: '.number()',
		int: '.number().integer()',
		arrStart: '.array().items(',
		arrEnd: ')'
	};

	switch(prop.propType){
		case 'object':
			str += prop.propName+': '+joiParts.joi+joiParts.objStart;
			prop.contains.forEach(function(item, index){
				str = addJoiProperty(item, str);
			});
			str = str.replace(/,$/, '');
			str += joiParts.objEnd+joiParts.req+',';
			break;
		case 'array':
			str += prop.propName+': '+joiParts.joi+joiParts.arrStart;
			prop.contains.forEach(function(item, index){
				if(item.propType === 'object'){
					str += joiParts.joi+joiParts.objStart;
					item.contains.forEach(function(item, index){
						str = addJoiProperty(item, str);
					});
					str = str.replace(/,$/, '');
					str += joiParts.objEnd+',';
				} else if (item.propType === 'array'){
					str += joiParts.joi+joiParts.arrStart;
					prop.contains.forEach(function(item, index){
						str = addJoiProperty(item, str);
					});
					str += joiParts.arrEnd+',';
				} else if (item.propType === 'integer'){
					str += joiParts.joi+joiParts.int+',';
				} else {
					str += joiParts.joi+'.'+item.propType+'()'+',';
				}
			});
			str = str.replace(/,$/, '');
			str += joiParts.arrEnd+joiParts.req+',';
			break;
		case 'integer':
			str += prop.propName+': '+joiParts.joi+joiParts.int + joiParts.req+',';
			break;
		default:
			str += prop.propName+': '+joiParts.joi+'.'+prop.propType+'()'+joiParts.req+',';
	}
	return str;
}

%>

module.exports = function <%= controllerName %>() {
	var self = this,
		routes = [
			{
				path: '/<%= pluralResourceName %>/{<%= idPropName %>}',
				method: 'GET',
				handler: function(request, reply){
					///////////////////////////////////////
					//TODO: Route functionality goes here.
					var response = <%= JSON.stringify(buildHandlerResponse(resourceProps)).replace(/"/g, '\'') %>;

					reply(response);
					///////////////////////////////////////
				},
				config: {
					description: 'Get a single <%= resourceName %> by <%= idPropName %>',
					tags: ['api'],
					cors:{
						methods: ['GET']
					},
					validate:{
						params:{
							<%= idPropName %>: Joi.<% if(idPropType === 'integer'){%><%= 'number().'+idPropType+'().required()' %><% }else{ %><%= idPropType+'().required()'%><% } %>
						},
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown()
					},
					response:{
						//TODO: verify and complete response model according to your contract.
						schema: <%= buildResponseScheme(resourceProps) %>.options({skipFunctions: true}).meta({className: '<%= resourceName %>Response'})
					},
					plugins:{
						'hapi-swagger-json': {
							overview: 'Individual <%= resourceName %> by <%= idPropName %> routes', //TODO: Provide a more accurate overview description
							responseMessages: [
								{code: 400, message: 'Bad Request'},
								{code: 401, message: 'Unauthorized'},
								{code: 404, message: 'Not Found'},
								{code: 500, message: 'Internal Server Error'}
							]
						}
					}
				}
			},
			{
				path: '/<%= pluralResourceName %>/{<%= idPropName %>}',
				method: 'OPTIONS',
				handler: function(request, reply){
					reply().header('Accept', 'OPTIONS, GET, PUT, POST, DELETE').code(204);
				},
				config: {
					auth: false,
					cors: {
						methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
					}
				}
			},
			{
				path: '/<%= pluralResourceName %>',
				method: 'OPTIONS',
				handler: function(request, reply){
					reply().header('Accept', 'OPTIONS, GET, POST').code(204);
				},
				config: {
					auth: false,
					cors: {
						methods: ['GET', 'POST', 'OPTIONS']
					}
				}
			},
			{
				path: '/<%= pluralResourceName %>',
				method: 'GET',
				handler: function(request, reply){
					///////////////////////////////////////
					//TODO: Route functionality goes here.
					var response = {<%= pluralResourceName %>: [] };

					for(var i = 0; i<5; i++){
						var <%= resourceName %> = <%= JSON.stringify(buildHandlerResponse(resourceProps)).replace(/"/g, '\'') %>;
						response.<%= pluralResourceName %>.push(<%= resourceName %>);
					}

					reply(response);
					///////////////////////////////////////
				},
				config: {
					description: 'Get a list of <%= pluralResourceName %>',
					tags: ['api'],
					cors:{
						methods: ['GET']
					},
					validate:{
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown()
					},
					response:{
						//TODO: verify and complete response model according to your contract.
						schema: Joi.object({
							<%= pluralResourceName %>: Joi.array().items(
								<%= buildResponseScheme(resourceProps) %>.options({skipFunctions: true}).meta({className: '<%= resourceName %>Response'})
							)
						})
					},
					plugins:{
						'hapi-swagger-json': {
							overview: '<%= pluralResourceName %> collection routes', //TODO: Provide a more accurate overview description
							responseMessages: [
								{code: 401, message: 'Unauthorized'},
								{code: 500, message: 'Internal Server Error'}
							]
						}
					}
				}
			},
			{
				path: '/<%= pluralResourceName %>',
				method: 'POST',
				handler: function(request, reply){
					///////////////////////////////////////
					//TODO: Route functionality goes here.
					request.payload.<%= idPropName %> = <%= getRandom(idPropType) %>;

					reply(request.payload).created('<%= pluralResourceName %>/<%= getRandom(idPropType) %>');
					///////////////////////////////////////
				},
				config: {
					description: 'Create a new <%= resourceName %>',
					tags: ['api'],
					cors:{
						methods: ['POST']
					},
					validate:{
						//TODO: verify and complete request model according to your contract.
						payload: <%= buildResponseScheme(resourceProps, idPropName) %>.meta({className: 'POST_<%= resourceName %>Request'}),
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown()
					},
					response:{
						//TODO: verify and complete response model according to your contract.
						schema: <%= buildResponseScheme(resourceProps) %>.options({skipFunctions: true}).meta({className: '<%= resourceName %>Response'})
					},
					plugins:{
						'hapi-swagger-json': {
							responseMessages: [
								{code: 400, message: 'Bad Request'},
								{code: 401, message: 'Unauthorized'},
								{code: 500, message: 'Internal Server Error'}
							]
						}
					}
				}
			},
			{
				path: '/<%= pluralResourceName %>/{<%= idPropName %>}',
				method: 'PUT',
				handler: function(request, reply){
					///////////////////////////////////////
					//TODO: Route functionality goes here.
					if(request.payload.<%= idPropName %> !== request.params.<%= idPropName %>){
						return reply(Boom.badRequest('<%= idPropName %> in path and in request do not match.'));
					}

					if(request.params.<%= idPropName %> === 999999){
						return reply(Boom.notFound());
					}

					reply(request.payload);
					///////////////////////////////////////
				},
				config:{
					description: 'Updates an existing <%= resourceName %>',
					tags: ['api'],
					cors:{
						methods: ['PUT']
					},
					validate:{
						params:{
						<%= idPropName %>: Joi.<% if(idPropType === 'integer'){%><%= 'number().'+idPropType+'().required()' %><% }else{ %><%= idPropType+'().required()'%><% } %>
						},
						//TODO: verify and complete request model according to your contract.
						payload: <%= buildResponseScheme(resourceProps) %>.meta({className: 'PUT_<%= resourceName %>Request'}),
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown()
					},
					response:{
						//TODO: verify and complete response model according to your contract.
						schema: <%= buildResponseScheme(resourceProps) %>.options({skipFunctions: true}).meta({className: '<%= resourceName %>Response'})
					},
					plugins:{
						'hapi-swagger-json': {
							responseMessages: [
								{code: 400, message: 'Bad Request'},
								{code: 401, message: 'Unauthorized'},
								{code: 404, message: 'Not Found'},
								{code: 500, message: 'Internal Server Error'}
							]
						}
					}
				}
			},
			{
				path: '/<%= pluralResourceName %>/{<%= idPropName %>}',
				method: 'DELETE',
				handler: function(request, reply){
					///////////////////////////////////////
					//TODO: Route functionality goes here.
					if(request.params.<%= idPropName %> === 999999){
						return reply(Boom.notFound());
					}

					reply().code(204);
					///////////////////////////////////////
				},
				config: {
					description: 'Remove an existing <%= resourceName %>',
					tags: ['api'],
					cors: {
						methods: ['DELETE']
					},
					validate: {
						params:{
						<%= idPropName %>: Joi.<% if(idPropType === 'integer'){%><%= 'number().'+idPropType+'().required()' %><% }else{ %><%= idPropType+'().required()'%><% } %>
						},
						headers: Joi.object({
							authorization: Joi.string().required()
						}).unknown()
					},
					response: {
						schema: false
					},
					plugins:{
						'hapi-swagger-json': {
							responseMessages: [
								{code: 401, message: 'Unauthorized'},
								{code: 404, message: 'Not Found'},
								{code: 500, message: 'Internal Server Error'}
							]
						}
					}
				}
			}
		];

	self.getRoutes = function(){return routes;};
	return self;
};