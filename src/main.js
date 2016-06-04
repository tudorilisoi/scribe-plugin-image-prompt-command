var extend = require('extend');

/**
 * Creates simple image. You can pass it a link prompt function
 * that will be called when command is executed. The function should return
 * valid url. So please validate.
 * @optional  {Object}   options Options for created image
 * @optional  {Function} prompt Function for getting the url
 * @return {function}
 */
function command(options, prompt) {
	return function (scribe) {
		var imagePromptCommand = new scribe.api.Command('insertHTML');
		imagePromptCommand.nodeName = 'IMG';

		if (typeof options == 'function') {
			prompt = options;
		}

		imagePromptCommand.execute = function () {
			var self = this;
			var link = prompt ? prompt() : window.prompt('Enter image url');
			if (link) {
				if (link.then) { //support promises
					link.then(function (promisedLink) {
						execute.call(self, promisedLink, options, scribe)
					})

				} else { //or a classic function
					execute.call(self, link, options, scribe)
				}
			}

		}

		scribe.commands.imagePrompt = imagePromptCommand;
	};
}

function execute(link, options, scribe) {
	console.log('EDITOR INSERT', arguments);
	if (typeof link === 'object') {
		// If some extra properties were passed from prompt
		options = extend(options, link);
	} else if (typeof link === 'string') {
		options.url = link
	}

	var url = options.url;
	var html = addAttributes('<img src=' + url + '>', options.attributes);

	scribe.api.SimpleCommand.prototype.execute.call(scribe.commands.imagePrompt, html);
}

function addAttributes(html, attrs) {
	var host = document.createElement('div');
	host.innerHTML = unescape(html);

	var frame = host.children[0];
	for (var prop in attrs) {
		frame.setAttribute(prop, attrs[prop]);
	}

	return host.innerHTML;
}

module.exports  = {
	command:command,
	execute:execute,
}
