// Falta agregar permisos y limitar el comando.
module.exports = {
	name: 'say',
	description: 'Haz que el bot diga algo.',
	category: 'Fun',
	expectedArgs: '< normal/reply > *message-id*; < texto >',
	callback: async ({ message, args, text }) => {
		// modo normal
		if (args[ 0 ].slice(0, 6) == 'normal') {
			let say = text.split('; ');
			await message.channel.send(say[ 1 ]);
			message.delete();
		}

		// modo respuesta
		if (args[ 0 ] == 'reply') {
			try {
				let messageId = args[ 1 ].replace(/;/, '');
				let toreply = await message.channel.messages.fetch(messageId);
				let say = text.split('; ');
				toreply.reply(say[ 1 ])
				message.delete();
			} catch (e) {
				message.channel.send('No encontré ese mensaje en este canal...')
			}
		}
	}
}