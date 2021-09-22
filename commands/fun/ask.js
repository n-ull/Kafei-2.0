// ask pregunta
const cleverbot = require('cleverbot-free');
module.exports = {
	name: 'ask',
	aliases: [ 'ia', 'ai' ],
	description: 'Habla con Kafei o preguntale lo que desees.',
	category: 'Fun',
	guildOnly: true,
	expectedArgs: '<pregunta o mensaje>',
	maxArgs: 20,
	cooldown: "25s",
	callback: async ({ message, text }) => {
		const question = text ? text : false;
		const responses = [
			'Yo que sé, me ves cara de adivina?',
			'Solo se que morti se la come.',
			'Era bait bro XD.',
			'Mira, a mi no me hables de esta forma porque yo se karate, yudo y jiujitsu.',
			'Deja de mirarme con esos hermosos ojos, me derrites.',
			'Never gonna give you up, never gonna let you down.',
			'Goku le gana.',
			'Mi sueño es algún día convertirme en furra para poder ir a una convención de furros y quemarlos a todos.',
			'MODO SEXO.',
			'JA.',
			'BTS si que logró un impacto en la industria de la música...',
			'шлюха, которая читает.',
			'aaaaaaa prro trais el ocnitricssssssss.',
			'xd a bueno.',
			'La respuesta está en tu corazón.'
		]

		if (question == false) {
			message.reply(responses[Math.floor(Math.random() * responses.length) + 1])
		} else {
			try {
				let response = await cleverbot(question)
				message.reply(response)
			} catch (error) {
				message.reply(responses[Math.floor(Math.random() * responses.length) + 1])
			}
		}
	}
}