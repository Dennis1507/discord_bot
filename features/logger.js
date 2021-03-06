const Discord = require('discord.js');

module.exports = client => {

	client.on('channelCreate', async channel => {

		if (channel.type === 'dm') return;

		const { logs, logsChannelId } = client.data.guilds.get(channel.guild.id);

		const logsChannel = channel.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('channelCreate') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Channel Created')
			.setColor('#00FF48')
			.addField('Name', channel.name, true)
			.addField('Type', channel.type, true)
			.addField('ID', `\`\`\`js\nCHANNEL = ${channel.id}\`\`\``)
			.setFooter('channelCreate', client.user.displayAvatarURL())
			.setTimestamp(Date.now());

		const fetchedLog = (await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_CREATE' })).entries.first();

		if (fetchedLog?.target === channel) {
			Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL());
		}

		logsChannel.send(Embed);

	});

	client.on('channelDelete', async channel => {

		if (channel.type === 'dm') return;

		const { logs, logsChannelId } = client.data.guilds.get(channel.guild.id);

		const logsChannel = channel.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('channelDelete') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Channel Deleted')
			.setColor('RED')
			.addField('Name', channel.name, true)
			.addField('Type', channel.type, true)
			.addField('ID', `\`\`\`js\nCHANNEL = ${channel.id}\`\`\``)
			.setFooter('channelDelete', client.user.displayAvatarURL())
			.setTimestamp(Date.now());

		const fetchedLog = (await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_DELETE' })).entries.first();

		if (fetchedLog?.target === channel) {
			Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL());
		}

		logsChannel.send(Embed);

	});

	client.on('channelUpdate', async (oldChannel, newChannel) => {

		if (oldChannel.type === 'dm' || newChannel.type === 'dm') return;

		const { logs, logsChannelId } = client.data.guilds.get(newChannel.guild.id);

		const logsChannel = newChannel.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('channelUpdate') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Channel Updated')
			.setColor('YELLOW')
			.setFooter('channelUpdate', client.user.displayAvatarURL())
			.setTimestamp(Date.now());

		if (oldChannel.name !== newChannel.name) {

			Embed.addField('Name Before', oldChannel.name, true);
			Embed.addField('Name Now', newChannel.name, true);

		}
		else {
			Embed.addField('Name', newChannel.name, false);
		}
		if (oldChannel.parent !== newChannel.parent) {

			Embed.setDescription('Channel Moved');

			let oldParent = 'none', newParent = 'none';

			if (oldChannel.parent) oldParent = oldChannel.parent.name;
			if (newChannel.parent) newParent = newChannel.parent.name;

			Embed.addField('Category Before', oldParent, true);
			Embed.addField('Category After', newParent, true);

		}

		if (newChannel.type === 'text') {

			if (oldChannel.nsfw !== newChannel.nsfw) {

				if (newChannel.nsfw) {
					Embed.addField('NSFW Change', 'Changed channel to be NSFW.');
				}
				else {
					Embed.addField('NSFW Change', 'Changed channel not to be NSFW anymore.');
				}

			}

			if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
				Embed.addField('Slowmode Changed', `${oldChannel.rateLimitPerUser}s => ${newChannel.rateLimitPerUser}s`);
			}

			if (oldChannel.topic !== newChannel.topic) {
				if (newChannel.topic) {
					Embed.addField('Topic Changed', newChannel.topic);
				}
				else {
					Embed.addField('Topic Removed', oldChannel.topic);
				}

			}

		}
		else if (newChannel.type === 'voice') {

			if (oldChannel.bitrate !== newChannel.bitrate) {
				Embed.addField('Bitrate Change', `${oldChannel.bitrate} => ${newChannel.bitrate}`, false);
			}

			if (oldChannel.userLimit !== newChannel.userLimit) {
				Embed.addField('Userlimit Change', `${oldChannel.userLimit} => ${newChannel.userLimit}`, false);
			}

		}

		// How do I print the permission changes of a channel. pls help


		if (Embed.fields.length > 1) {

			Embed.addField('ID', `\`\`\`js\nCHANNEL = ${newChannel.id}\`\`\``);

			const fetchedLog = (await newChannel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_UPDATE' })).entries.first();

			if (fetchedLog?.target === newChannel) Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL());

			logsChannel.send(Embed);

		}


	});

	client.on('guildBanAdd', async (guild, user) => {

		const { logs, logsChannelId } = client.data.guilds.get(guild.id);

		const logsChannel = guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('guildBanAdd') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Member Banned')
			.setColor('RED')
			.addField('User', user.tag)
			.setFooter('guildBanAdd', client.user.displayAvatarURL())
			.setTimestamp(Date.now());

		const fetchedLog = (await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' })).entries.first();

		if (fetchedLog?.target === user) Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL());

		logsChannel.send(Embed);

	});

	client.on('guildBanRemove', async (guild, user) => {

		const { logs, logsChannelId } = client.data.guilds.get(guild.id);

		const logsChannel = guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('guildBanRemove') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Member Unbanned')
			.setColor('GREEN')
			.addField('User', user.tag)
			.setFooter('guildBanRemove', client.user.displayAvatarURL())
			.setTimestamp(Date.now());

		const fetchedLog = (await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE' })).entries.first();

		if (fetchedLog?.target === user) Embed.setAuthor(fetchedLog.executor.tag, fetchedLog.executor.displayAvatarURL());

		logsChannel.send(Embed);

	});

	client.on('guildMemberAdd', async member => {

		const { logs, logsChannelId } = client.data.guilds.get(member.guild.id);

		const logsChannel = member.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('guildMemberAdd') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Member Joined')
			.setColor('#00FF48')
			.setImage(member.user.displayAvatarURL({ dynamic : true, size: 128 }))
			.setDescription(`${member.displayName} joined the server.`)
			.addField('Account Created:', member.user.createdAt.toDateString())
			.addField('ID', `\`\`\`js\nUSER = ${member.id}\`\`\``)
			.setFooter('guildMemberAdd', client.user.displayAvatarURL())
			.setTimestamp(Date.now());

		logsChannel.send(Embed);
	});

	client.on('guildMemberRemove', async member => {

		const { logs, logsChannelId } = client.data.guilds.get(member.guild.id);

		const logsChannel = member.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || (!logs.get('guildMemberRemove') && !logs.get('guildMemberKick')) || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setColor('#FF2A2A')
			.setImage(member.user.displayAvatarURL({ dynamic : true, size: 128 }))
			.setDescription(`${member.displayName} left the server.`)
			.addField('Joined Server:', member.joinedAt.toDateString())
			.setFooter('guildMemberRemove', client.user.displayAvatarURL())
			.setTimestamp(Date.now());


		const kicked = (await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' })).entries.first();

		if (kicked?.target === member.user && logs.get('guildMemberKick')) {

			Embed.setTitle('Member Kicked')
				.setAuthor(kicked.executor.tag, kicked.executor.displayAvatarURL({ dynamic: true }));
		}
		else {
			Embed.setTitle('Member Left');
		}

		Embed.addField('ID', `\`\`\`js\nUSER = ${member.id}\`\`\``);

		logsChannel.send(Embed);
	});

	client.on('guildMemberUpdate', async (oldMember, newMember) => {

		const { logs, logsChannelId } = client.data.guilds.get(newMember.guild.id);

		const logsChannel = newMember.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('guildMemberUpdate') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setFooter('guildMemberUpdate', client.user.displayAvatarURL())
			.setTimestamp(Date.now())
			.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL({ dynamic : true, size: 128 }));

		if (oldMember.nickname !== newMember.nickname) {
			Embed.setTitle('Nickname changed')
				.addField('Before:', oldMember.displayName, true)
				.addField('Now:', newMember.displayName, true);

			const auditLog = (await newMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_UPDATE' })).entries.first();

			if (auditLog?.target === newMember.user && auditLog?.changes[0].old === oldMember.nickname && auditLog?.changes[0].new === newMember.nickname) {
				Embed.addField('Moderator:', auditLog.executor.username + '#' + auditLog.executor.discriminator);
			}
		}
		else if (oldMember.user.username !== newMember.user.username) {

			Embed.setTitle('Username changed')
				.addField('Before:', oldMember.user.username, true)
				.addField('Now:', newMember.user.username, true);

		}
		else { return; }

		Embed.addField('ID', `\`\`\`js\nUSER = ${newMember.id}\`\`\``);

		logsChannel.send(Embed);

	});

	client.on('messageDelete', async message => {

		if (message.channel.type === 'dm') return;

		if (message.partial || message.author.bot) return;

		const { logs, logsChannelId } = client.data.guilds.get(message.guild.id);

		const logsChannel = message.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('messageDelete') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Message Deleted')
			.setColor('#5B0000')
			.setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
			.setFooter('messageDelete', client.user.displayAvatarURL());

		if (message.content) Embed.addField('Inhalt:', message.content);

		let writtenH = message.createdAt.getHours();
		if(writtenH / 10 < 1) writtenH = `0${writtenH}`;
		let writtenM = message.createdAt.getMinutes();
		if(writtenM / 10 < 1) writtenM = `0${writtenM}`;

		Embed.addField('Message written:', `${writtenH}:${writtenM}, ${message.createdAt.toDateString()}`)
			.addField('Channel:', message.channel)
			.setTimestamp(Date.now());

		const fetchedLogs = (await message.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' })).entries.first();

		if (fetchedLogs?.target === message.author) Embed.addField('Moderator:', fetchedLogs.executor);
		if (message.attachments.size != 0) Embed.addField('Attachment:', message.attachments.first().url);

		Embed.addField('ID', `\`\`\`js\nMESSAGE = ${message.id}\nAUTHOR = ${message.author.id}\`\`\``);

		logsChannel.send(Embed);
	});

	client.on('messageDeleteBulk', async messages => {

		const { logs, logsChannelId } = client.data.guilds.get(messages.first().guild.id);

		const logsChannel = messages.first().guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('messageDelete') || !logsChannel) return;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Message Bulk Deleted')
			.addField('Channel:', messages.first().channel.name)
			.addField('Amount:', messages.size)
			.setFooter('messageDeleteBulk', client.user.displayAvatarURL());

		logsChannel.send(Embed);

	});

	client.on('messageUpdate', async (oldMessage, newMessage) => {

		if (oldMessage.partial || newMessage.partial) return;

		if (newMessage.channel.type === 'dm' || newMessage.author.bot) return;

		if (oldMessage.content === newMessage.content) return;

		const { logs, logsChannelId } = client.data.guilds.get(newMessage.member.guild.id);

		const logsChannel = newMessage.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('messageUpdate') || !logsChannel) return;

		let writtenH = oldMessage.createdAt.getHours();
		if(writtenH / 10 < 1) writtenH = `0${writtenH}`;
		let writtenM = oldMessage.createdAt.getMinutes();
		if(writtenM / 10 < 1) writtenM = `0${writtenM}`;

		const Embed = new Discord.MessageEmbed()
			.setTitle('Message Edited')
			.setColor('#292b2f')
			.setAuthor(newMessage.member.displayName, newMessage.author.displayAvatarURL({ dynamic: true }))
			.addField('Before:', oldMessage.content)
			.addField('Now:', newMessage.content)
			.addField('Message written:', `${writtenH}:${writtenM}, ${oldMessage.createdAt.toDateString()}`)
			.addField('Channel:', `${newMessage.channel} \n [Go To Message](${newMessage.url})`)
			.setFooter('messageUpdate', client.user.displayAvatarURL())
			.setTimestamp(Date.now());

		Embed.addField('ID', `\`\`\`js\nMESSAGE = ${newMessage.id}\nAUTHOR = ${newMessage.author.id}\`\`\``);

		logsChannel.send(Embed);
	});

	client.on('voiceStateUpdate', async (oldState, newState) => {

		if (oldState.channel === newState.channel) return;

		const { logs, logsChannelId } = client.data.guilds.get(newState.member.guild.id);

		const logsChannel = newState.guild.channels.cache.find(c => c.id === logsChannelId);

		if (!logs || !logs.get('voiceStateUpdate') || !logsChannel) return;

		if(newState.channel) {
			if(oldState.channel) {

				const Embed = new Discord.MessageEmbed()
					.setTitle('Voice Channel switched')
					.setColor('#292b2f')
					.setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({ dynamic : true }))
					.addField('Before:', oldState.channel.name, true)
					.addField('Now:', newState.channel.name, true)
					.setFooter('voiceStateUpdate', client.user.displayAvatarURL())
					.setTimestamp(Date.now());

				logsChannel.send(Embed);
			}
			else {

				const Embed = new Discord.MessageEmbed()
					.setTitle('Voice Channel joined')
					.setColor('#292b2f')
					.setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({ dynamic : true }))
					.addField('Channel:', newState.channel.name)
					.setFooter('voiceStateUpdate', client.user.displayAvatarURL())
					.setTimestamp(Date.now());

				logsChannel.send(Embed);
			}
		}
		else if (oldState.channel) {

			const Embed = new Discord.MessageEmbed()
				.setTitle('Voice Channel left')
				.setColor('#292b2f')
				.setAuthor(oldState.member.displayName, oldState.member.user.displayAvatarURL({ dynamic : true }))
				.addField('Channel:', oldState.channel.name)
				.setFooter('voiceStateUpdate', client.user.displayAvatarURL())
				.setTimestamp(Date.now());

			logsChannel.send(Embed);
		}
	});
};