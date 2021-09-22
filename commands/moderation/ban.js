module.exports = {
	name: 'ban',
	category: 'Moderation',
	aliases: [ 'banear' ],
	description: 'Con este mágico comando podrás hacer desaparecer el olor a pendejo.',
	expectedArgs: '<@user> <razón>',
	guildOnly: true,
	permissions: ['ADMINISTRATOR'],
	callback: ({ message, args }) => {
		let target = message.mentions.members.first();
		const reason = args.slice(1).join(' ')
		if (!target) {
            message.reply("Tienes que decirme a quién desterrar.")
            return
        }

		// Si el target es el autor del comando
		if(target.id == message.author.id){
			message.reply("¿Eres tonto o te dicen Toby?")
			return
		}

		// No se puede banear a este usuario
        if (!target.bannable){
            message.reply("No puedo desterrarlo, me da pena, pobre criatura fea :sob:")
            return
        }

        // No se especificó razón
        if (!reason && target.bannable) {
            target.ban({reason: `Sin razón, baneado por ${message.author.tag}`});
            const embed = new MessageEmbed()
                .setTitle("**¡Bye bye!**")
                .setColor('#457dde')
                .addField(`El usuario ${target.displayName} fue condenado a caminar sin rumbo en el hades`, `Dudo que vuelva, no lo extrañen!`)
                .setTimestamp()
                .setFooter(`Desterrado por ${message.author.tag}`, message.author.avatarURL());

            message.channel.send({embeds: [embed]})
        }

		// Razón
		if (reason && target.bannable) {
            target.ban({reason: reason + ` baneado por ${message.author.tag}`});
            const embed = new MessageEmbed()
                .setTitle("**¡A tu casa maldito autista!**")
                .setColor('#457dde')
                .addField(`El usuario ${target.displayName} no podrá volver`, `Dicen que la razón es: ${reason}`)
                .setTimestamp()
                .setFooter(`A ver si vuelve a meterse con ${message.author.tag}`, message.author.avatarURL());

            message.channel.send({embeds: [embed]})
        }
	}
}