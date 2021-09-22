// choice cosa 1; cosa 2; cosa 3 | selecciona entre algun argumento separado en punto y coma.
module.exports = {
	name: 'choice',
	aliases: [ 'elegir', 'seleccionar', 'random' ],
	description: 'Seleccionaré entre 2 o más cosas que me digas.',
	category: 'Fun',
	expectedArgs: 'Cosa 1; Cosa 2; Cosa 3 | Separar argumentos con punto y coma.',
	minArgs: 2,
	callback: ({ message, text }) => {
		let args = text.split('; ');
		let random = Math.floor(Math.random() * args.length);
		message.reply(`Definitivamente diría que: \`${args[random]}\``);
	}
}