require('dotenv').config();
const DiscordJS = require('discord.js');
const WOKCommands = require('wokcommands');
const path = require('path');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

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
    testServers: '860280485817483264',
    disabledDefaultCommands: [
      'help'
    ]
  })
    .setDefaultPrefix('-')
    .setColor(0xff0000)
    .setMongoPath(process.env.MONGO)
    .setBotOwner([ '244535132097216512', '340664343853006849' ]);
})

// readline.on('line', (input) => {
//   try{
//     console.log(eval(input))
//   } catch (error){
//     console.log(error)
//   }
// })

client.login(process.env.TOKEN)

