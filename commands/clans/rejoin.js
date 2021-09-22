// Te quita tu clan actual para darte el correspondiente a tu ID con el módulo de la cantidad de clanes
// Usar este comando podría enviarte a otro clan.
const clans = require('../../utils/clansManage');

module.exports = {
	name: 'rejoin',
	aliases: [ 'getclan' ],
	description: 'Este comando te asignará el clan que te corresponde por tu ID y la cantidad de clanes existentes.',
	category: 'Clans',
	guildOnly: true,
	callback: async ({ message }) => {
	let user = message.member;
	message.channel.send(await clans.join(user, message.guildId));
	}
}