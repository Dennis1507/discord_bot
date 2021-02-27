module.exports = {
	name: 'setup',
	description: 'A command to setup certain things on your server.',
	args: 1,
	guild: true,
	permissions: 'ADMINISTRATOR',
	usage: ['mute'],
	async execute(message, args) {

		switch(args[0]) {
		case 'mute': {

			let mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');

			let changedChannels = 0;

			if (mutedRole) {
				message.guild.channels.cache.forEach(element => {

					if (element.type != 'text') return;

					element.updateOverwrite(mutedRole, { SEND_MESSAGES: false });

					changedChannels = changedChannels + 1;

				});

				message.channel.send(`Successfully set up the Muted role for ${changedChannels} channels.`);
			}
			else {

				mutedRole = await message.guild.roles.create({ data: { name: 'Muted', permissions: 0 } });

				message.guild.channels.cache.forEach(element => {

					if (element.type != 'text') return;

					element.updateOverwrite(mutedRole, { SEND_MESSAGES: false });

					changedChannels = changedChannels + 1;

				});

				message.channel.send(`Successfully created the ${mutedRole} role and set it up for ${changedChannels} channels.`);
			}
			break;
		}
		}

	},
};