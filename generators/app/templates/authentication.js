var Boom = require('boom'),
	Hoek = require('hoek');

module.exports.name = 'fnordAuth';

module.exports.scheme = function(server, options) {

	var token,
		self = this,
		settings = options ? Hoek.applyToDefaults({}, options) : {},
		checkToken = function(token, callback) {

			//TODO: Add auth validation here.
			callback(null, true);
		};

	self.name = 'fnordAuth';

	self.authenticate = function(request, reply) {

		//TODO begin authorization check here. The below example initially checks for an authotrization header. If it exists, it passes it on to a validation method.

		token = request.raw.req.headers['authorization'];
		if (!token) {
			process.nextTick(function () {
				reply(Boom.unauthorized('Missing auth token.', self.name), null, { credentials: null, artifacts: {}});
			});
		}
		else {
			checkToken(token, function (err, isValid) {

				//error from validation method
				if (err) {
					return reply(Boom.unauthorized('Unauthorized: ' + err.message, self.name), null, { credentials: token, artifacts: {}});
				}

				//token is good
				if (isValid) {
					reply.continue({ credentials: token, artifacts: {}});
				}
				//token failed validation
				else {
					reply(Boom.unauthorized('Unauthorized: Invalid token', self.name), null, { credentials: token, artifacts: {}});
				}
			});
		}
	};

	return self;
};