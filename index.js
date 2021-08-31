require('dotenv').config();
const DiscordJS = require('discord.js')
const WOKCommands = require('wokcommands')
const path = require('path')

const { Intents } = DiscordJS

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
})

client.on('ready', () => {
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, 'commands'),
    featuresDir: path.join(__dirname, 'features'),
    showWarns: true,
    defaultLangauge: 'spanish',
    ignoreBots: true,
    dbOptions: {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    disabledDefaultCommands: [
      'help'
    ]
  })
    .setDefaultPrefix('-')
    .setColor(0xff0000)
    .setMongoPath(process.env.MONGO)
})

client.login(process.env.TOKEN)