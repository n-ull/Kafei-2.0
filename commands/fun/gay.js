const { MessageAttachment, MessageEmbed } = require('discord.js');
const progressbar = require('string-progressbar');
const { imageHash } = require('image-hash');

module.exports = {
    name: 'gay',
    aliases: ['homosexual', 'homosensual', 'putazo', 'lgbt'],
    description: 'Descubre qué tan en el infierno estarás por maricón.',
    category: 'Fun',
    expectedArgs: '< @Usuario > (opcional)',
    maxArgs: 1,
    guildOnly: true,
    callback: ({ client, message }) => {
        let user = message.mentions.users.first()
        	|| message.author;
        const nazi = client.emojis.cache.get("865977122451750922");
        let avatar = user.displayAvatarURL({ format: 'jpg', size: 64 })
        imageHash(avatar, 8, true, (error, data) => {
            if (error) throw error;
            let gaylvl = parseInt(data, 16) % 101;
            if(user.id == "244535132097216512") gaylvl = 101;

            if (gaylvl == 101) {
                const embed = new MessageEmbed()
                    .setAuthor(`Calculando nazismo de: ${user.username}`, avatar)
                    .addField('------------------------------------------------------', "*Es un 100% nazi...*")
                    .addField('------------------------------------------------------', `[${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}${nazi}]`)
                message.channel.send({embeds: [embed]})
                return
            }

            var total = 100;
            var bar = progressbar.filledBar(total, gaylvl, 14, '▫️', '🏳️‍🌈');
            const embed = new MessageEmbed()
                .setAuthor(`Calculando homosexualidad de: ${user.username}`, avatar)
                .addField('------------------------------------------------------', user.id == message.author.id ? `*Eres un ${gaylvl}% gay...*` : `Es un ${gaylvl}% gay...`)
                .addField('------------------------------------------------------', `[${bar[0]}]`);
            if(gaylvl == 0){
                embed.setImage('https://i.pinimg.com/originals/7f/2e/19/7f2e190365fde21a51610bf8c905fc9c.jpg')
            }
            message.channel.send({embeds: [embed]})
            return
        });


    }
}