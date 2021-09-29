let Uno = require('../../games/uno');
module.exports = {
name: 'uno',
description: 'Juega UNO!',
aliases: ['tres'],
guildOnly: true,
callback: async ({message, interaction})=> {
await Uno(message, interaction)
}
}