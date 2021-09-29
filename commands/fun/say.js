// Falta agregar permisos y limitar el comando.
module.exports = {
	name: 'say',
	description: 'Haz que el bot diga algo.',
	category: 'Fun',
	testOnly: true,
	slash: true,
	hidden: true,
	options: [
		{
			name: 'message', // Must be lower case
			description: 'El mensaje que debo decir.',
			required: true,
			type: 3, // This argument is a string
		},
		{
			name: 'reply', // Must be lower case
			description: 'Si es una respuesta escribir el id del mensaje a responder',
			required: false,
			type: 3, // This argument is a string
		}
	],
	expectedArgs: '<mensaje> <id del mensaje a responder>',
	callback: async ({ interaction, args }) => {
		const message = args[ 0 ];
		const msgid = args[ 1 ];
		if(!msgid){
			interaction.channel.send(message);
		} else {
			try {
				const target = await interaction.channel.messages.fetch(msgid);
				target.reply({content: message, allowedMentions: {repliedUser: false}})
			} catch(err) {
				console.log(err);
				interaction.channel.send(message);
			}
		};

		interaction.reply({
			content: '¡Mensaje enviado!',
			ephemeral: true
		})
	}
}