const { play } = require('../../games/blackjack');

module.exports = {
	name: 'blackjack',
	aliases: [ 'bj', 'jackblack' ],
	description: 'Pierde todos tus ahorros con este magnífico juego.',
	expectedArgs: '< apuesta >',
	category: 'Games',
	guildOnly: true,
	callback: async ({ message, args, client }) => {
		await play(message)
	}
}