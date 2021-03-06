const Discord = require('discord.js');
const ud = require('urban-dictionary');

module.exports = {
	name: 'urban',
	description: 'Search for word definitions on urban dictionary.',
	args: true,
	usage: ['[word]'],
	async execute(message, args) {

		const terms = await ud.autocompleteExtra(args.join(' ')).catch(error => {

			if (error?.message === 'No results founds.') return message.channel.send(`Sorry, I couldn't find: ${args.join(' ')}.`);

			else if (error) return console.log(error);

		});

		let term;

		if (terms) {

			terms.forEach(element => {

				if (element.term.toLowerCase() === args.join(' ').toLowerCase()) {

					term = element.term;
				}
			});
		}

		if (!term) term = terms[0].term;

		if (term) {

			ud.define(term, async (error, results) => {

				if (error?.message === 'No results founds.') return message.channel.send(`Sorry, I couldn't find: ${args.join(' ')}.`);

				else if (error) return console.log(error);

				let result = results[0];

				if (results) {

					results.forEach(r => {
						if (r.thumbs_up > result.thumbs_up) {
							result = r;
						}
					});

					const Embed = new Discord.MessageEmbed()
						.setTitle(result.word)
						.setURL(result.permalink)
						.setAuthor(result.author)
						.setDescription(result.definition);
					if (result.example) Embed.addField('Example', result.example);
					Embed.addField('👍', result.thumbs_up, true)
						.addField('👎', result.thumbs_down, true)
						.setFooter(result.written_on);

					try {
						await message.channel.send(Embed);
					}
					catch (err) {
						console.log(err);
					}
				}
			});
		}
	},
};