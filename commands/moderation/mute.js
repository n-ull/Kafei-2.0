const { MessageEmbed } = require('discord.js');
const muteSchema = require('../../models/muteSchema.js')
module.exports = {
	name: 'mute',
	description: 'Calla a un usuario el tiempo que quieras, igual no quiero leerlo.',
	category: 'Moderation',
	guildOnly: true,
	permissions: [ 'KICK_MEMBERS' ],
	expectedArgs: '< @Usuario > < Tiempo(m/h/d) > < Razón >',
	minArgs: 1,
	callback: async ({ message, args }) => {
		const target = message.mentions.members.first()
		const guild = message.channel.guild
		let timer = {};

		// No hay usuario
		if (!target) {
			message.reply("Error de sintaxis, uso correcto: `-mute <@Usuario> <15m/h/d> <Razón>`")
			return
		}

		// No se especificó tiempo
		if (!args[ 1 ]) {
			timer = { time: '15', suffix: 'm' };
		} else timer = { time: args[ 1 ].match(/\d+/g).toString(), suffix: args[ 1 ].slice(-1) };

		if (timer.suffix !== "m" && timer.suffix !== "h" && timer.suffix !== "d") {
			message.reply("Debes especificar un número y el formato, ejemplo: `40m`")
			return
		}

		const reason = args.slice(2).join(' ')

		// Chequear si el usuario fue muteado
		const previousMutes = await muteSchema.find({
			userID: target.id
		})

		const currentlyMuted = previousMutes.filter(mute => {
			return mute.current === true
		})

		// El usuario ya estaba muteado en la DB
		if (currentlyMuted.length) {
			message.reply("Ese usuario ya está silencaido.");
			return
		}

		// No está muteado, proceder

		let duration = timer.time * (previousMutes + 1)
		const expires = new Date()
		// Minutos
		if (timer.suffix === "m") {
			expires.setMinutes(expires.getMinutes() + duration)
		}

		// Horas
		if (timer.suffix === "h") {
			expires.setHours(expires.getHours() + duration)
		}

		// Días
		if (timer.suffix === "d") {
			expires.setHours(expires.getHours() + duration * 24)
		}

		target.roles.add('863557625894666281')

		await new muteSchema({
			userID: target.id,
			guildID: guild.id,
			staffID: message.author.id,
			staffTag: message.author.tag,
			expires,
			current: true
		}).save()

		const embed = new MessageEmbed()
			.setTitle("**¡Llegó la policía!**")
			.setColor('#457dde')
			.setThumbnail("https://i.gifer.com/ULMC.gif")
			.addField(`El usuario "${target.user.tag}" fue arrestado`, `Será liberado en ${duration}${timer.suffix}`)
			.setTimestamp()
			.setFooter(`Arrestado por el oficial ${message.author.tag}`, message.author.avatarURL());

		if (reason) {
			embed.addField('Dicen que lo arrestaron por: ', reason)
		}

		message.channel.send({ embeds: [ embed ] })

	}
}