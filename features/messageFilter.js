module.exports = client => {
	function checkMessage(message) {

		// Check if member has Manage Messages Permissions in the message's channel.
		if (!message.member?.permissionsIn(message.channel).has('MANAGE_MESSAGES')) {

			// bannedWords: array
			const { bannedWords } = client.data.guilds.get(message.guild.id);

			if (!bannedWords) return;

			// Remove any whitespace characters and look for banned words. Delete message if found.
			if (bannedWords.some(word => message.content.toLowerCase().replace(/\s+/g, '').includes(word.replace(/\s+/g, '')))) {
				message.delete();
			}
		}
	}

	client.on('message', async message => {
		checkMessage(message);
	});

	client.on('messageUpdate', async (oldMessage, message) => {
		checkMessage(message);
	});
};