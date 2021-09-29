/**
 * @param {*} guilds Pasarle el cliente (message.client)
 */
module.exports = ({ guilds }) => {
	let GUILD1 = guilds.cache.get('892586895282958376');
	let GUILD2 = guilds.cache.get('892602982800162837');
	let EMOJIS = GUILD1.emojis.cache;
	let EMOJIS2 = GUILD2.emojis.cache;

	return EMOJIS.concat(EMOJIS2);
}