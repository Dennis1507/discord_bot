import * as Discord from 'discord.js';

const client = new Discord.Client();

require('./run.ts')();

console.log('hello');

client.on('message', (message: Discord.Message) => {
	console.log(message);
});

// client.login('')