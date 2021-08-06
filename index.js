require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS], partials: ['MESSAGE', 'GUILD_MEMBER', 'REACTION'] });

client.on('ready', () => {
  console.log(`Iniciado: ${client.user.tag}`);
});

client.login(process.env.TOKEN)