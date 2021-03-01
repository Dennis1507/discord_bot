const Discord = require('discord.js');

require('dotenv').config();

module.exports = client => {

	client.on('message', async message => {

		if (message.channel.type == 'dm') {
			if (message.author.bot || message.author.id === process.env.botOwnerId) return;

			const MessageDMEmbed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTimestamp(message.createdTimestamp);

			if (message.content) MessageDMEmbed.setDescription(message.content);
			if (message.attachments.size != 0) MessageDMEmbed.addField('Attachment:', message.attachments.first().url);

			// eslint-disable-next-line no-useless-escape
			const links = message.content.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

			client.users.cache.get(process.env.botOwnerId).send(MessageDMEmbed);
			if (links.length) client.users.cache.get(process.env.botOwnerId).send('Link Previews: \nhttps://' + links.join('\n https://'));
		}
	});
};