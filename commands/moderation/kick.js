module.exports = {
    name: "kick",
    category: 'Moderation',
    description: 'Sacale la chucha a un usuario',
    guildOnly: true,
    minArgs: 1,
    expectedArgs: '< @Usuario > < Razón >',
    permissions: ['KICK_MEMBERS'],
    callback: ({ client, message, args }) => {
        const target = message.mentions.members.first()
        const reason = args.slice(1).join(' ')
        // No hay usuario
        if (!target) {
            message.reply("Tienes que decirme a quién partirle la madre.")
            return
        }

		// Si el target es el autor del comando
		if(target.id == message.author.id){
			message.reply("¿Eres tonto o te dicen Toby?")
			return
		}

        // El usuario no se puede kickear
        if (!target.kickable) {
            message.reply("No puedo kickear a ese usuario.")
            return
        }

        // No se especificó razón
        if (!reason && target.kickable) {
            target.kick();
            const embed = new MessageEmbed()
                .setTitle("**¡La bota mágica!**")
                .setColor('#457dde')
                .addField(`El usuario ${target.displayName} fue pateado al más allá`, `Nadie lo extrañará :D`)
                .setTimestamp()
                .setFooter(`Pateado por el magnífico pié de ${message.author.tag}`, message.author.avatarURL());

            message.channel.send({embeds: [embed]})
        }

        // Se dio razón
        if (reason && target.kickable) {
            target.kick();
            const embed = new MessageEmbed()
                .setTitle("**¡La bota mágica!**")
                .setColor('#457dde')
                .addField(`El usuario ${target.displayName} tiene estampada una bota en el culo`, `Dicen que la razón es: ${reason}`)
                .setTimestamp()
                .setFooter(`Seguro no se olvidará de ${message.author.tag}`, message.author.avatarURL());

            message.channel.send({embeds: [embed]})
        }
    }
}