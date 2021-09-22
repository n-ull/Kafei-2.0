module.exports = {
    name: 'prune',
    aliases: ['purge'],
    category: 'Moderation',
    description: 'Borra x cantidad de mensajes',
    guildOnly: true,
    expectedArgs: '< Cantidad (Max = 99) >',
    permissions: ['KICK_MEMBERS'],
    minArgs: 1,
    maxArgs: 1,
    callback: ({ message, args }) => {
        const quantity = args[0]
        function doPurge(message, args) {
            var purgeamnt = args;
            var purgelimit = Number(purgeamnt) + 1;
            message.channel.messages.fetch({ limit: purgelimit }).then(messages => {
                message.channel.bulkDelete(messages);
                message.channel.send(messages.size + " mensajes borrados.").then(msg => setTimeout(() => msg.delete(), 5000));
            }).catch(err => {
                console.log(err)
            });
        }
        doPurge(message, quantity)
    }
}