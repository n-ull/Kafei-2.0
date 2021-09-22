const {MessageEmbed} = require('discord.js');
const muteSchema = require('../../models/muteSchema.js');
module.exports = {
    name: 'unmute',
    aliases: ['liberar', 'perdonar', 'ahoramedebesmucho'],
    description: 'Quitale la pena a un usuario',
    category: 'Moderation',
    guildOnly: true,
    expectedArgs: '< @Usuario >',
    permissions: ['KICK_MEMBERS'],
    maxArgs: 1,
    callback: async ({ message }) => {
        const target = message.mentions.members.first()

         // No hay usuario
         if (!target) {
            message.reply("No especificaste a quién perdonar...")
            return
        }

        target.roles.remove('863557625894666281')
        await muteSchema.deleteOne({
            userID: target.id
        })

        const embed = new MessageEmbed()
        .setTitle("**¡Has sido perdonado!**")
        .setColor('#457dde')
        .addField(`El usuario "${target.user.tag}" fue perdonado`, `Ya puedes volver a delinquir.`)
        .setTimestamp()
        .setFooter(`Liberado por el oficial ${message.author.tag}`, message.author.avatarURL());
     
        message.channel.send({embeds: [embed]})
    }
}