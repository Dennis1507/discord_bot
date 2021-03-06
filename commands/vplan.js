const DSB = require('dsbapi');
const scraper = require('table-scraper');
const Discord = require('discord.js');
const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = {
	name: 'vplan',
	description: 'Redacted',
	args: false,
	usage: ['0', '1'],
	async getPlan(timetables, klasse, titles, day, vplanUsers) {
		const Embed = new Discord.MessageEmbed()
			.setTitle(titles[day].innerHTML + ' | ' + klasse)
			.setURL(timetables.data[0].url)
			.setFooter('Zuletzt aktualisiert: ' + timetables.data[0].date);

		const tableData = await scraper.get(timetables.data[0].url);

		if (tableData[day][0]['Nachrichten zum Tag']) day++;

		tableData[day].forEach((entry, index) => {
			console.log(entry['Klasse(n)']);
			if (entry['Klasse(n)'] == klasse) {
				const users = [];

				for (const [id, array] of vplanUsers) {
					if (array.includes(entry['(Fach)'].replace(/\s+/g, '').toLowerCase())) users.push(id);
				}

				Embed.addField('__' + entry['(Fach)'] + (entry['(Fach)'] !== entry['Fach'] && entry['Fach'] != '' ? (' => ' + entry['Fach']) : '') + '__',
					`${(users.length ? '<@' : '')}${users.join('> <@')}${(users.length ? '>' : '')} \n St. ${entry['St.']} | Raum: ${entry['(Raum)']} ${(entry['(Raum)'] === entry['Raum'] ? '' : (' => ' + entry['Raum']))} \n ${entry['Art']} \n` + (entry['Hinweis'] !== '' ? 'Hinweis: ' + entry['Hinweis'] : ''));
			}
		});
		if (Embed.fields.length < 1) {
			Embed.setDescription('Keine Einträge für ' + klasse + ' gefunden.');
		}
		return Embed;
	},
	execute(message, args, client, prefix) {

		if (message.guild.id != 623904281837305869 && message.guild.id != 658323643629174784) return;

		if (args[0] === 'link') {
			args.shift();
			if (!args[0]) return message.channel.send('Please provide arguments.');
			(async () => {
				args = args.join(' ');
				args = args.split(',');

				for (let i = 0; i < args.length; i++) {
					args[i] = args[i].replace(/\s+/g, '').toLowerCase();
				}
				const UsersMap = client.data.guilds.get(message.guild.id).vplanUsers || new Map();

				UsersMap.set(message.author.id, args);

				await client.data.save(message.guild.id, client, { vplanUsers: UsersMap });
			})();
			return;
		}

		const dsb = new DSB('152902', 'Goethe');

		dsb.fetch()
			.then(async data => {
				const timetables = DSB.findMethodInData('timetable', data);

				const html = await axios.get(timetables.data[0].url);
				const dom = new JSDOM(html.data);

				const titles = dom.window.document.querySelectorAll('.mon_title');
				// titles[0].innerHTML

				const vplanUsers = client.data.guilds.get(message.guild.id).vplanUsers;

				let day = 1;

				if (titles[0]) {
					if (args[0] === '0') {
						day = 0;
					}
					else if (args[0] === '1') {
						day = 1;
					}
					else if (new Date().getUTCHours() < 13 && titles[0].innerHTML.startsWith(new Date().toLocaleDateString('de-DE'))) {
						day = 0;
					}

					if (vplanUsers?.get(message.author.id)?.length) {
						message.channel.send(`Your courses: ${vplanUsers.get(message.author.id).join(' ,')}`, { embed: await this.getPlan(timetables, 'E1/2', titles, day, vplanUsers) });
					}
					else {
						message.channel.send(await this.getPlan(timetables, 'E1/2', titles, day, vplanUsers));
					}
				}
				else {
					message.channel.send('Could not fetch data from\n' + timetables.data[0].url);
				}

			})
			.catch(e => {
				// An error occurred :(
				console.log(e);
			});
	},
};
