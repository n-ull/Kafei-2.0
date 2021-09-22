const { checkBal } = require('../../utils/economyManage');
module.exports = {
	name: 'wallet',
	aliases: [ 'bal', 'money', 'balance', 'dinero', 'mons' ],
	description: 'Revisa qué tan pobre eres.',
	expectedArgs: '< @Usuario > (Opcional)',
	category: 'Economía',
	guildOnly: true,
	callback: async ({ client, message }) => {
		let user = message.mentions.users.first()
		|| message.author;
		let emoji = client.emojis.cache.get("872783566487052318")
		message.channel.send({embeds: [{
			"title": `Billetera de **${user.tag}**`,
			"color": 10836921,
			"description": "----------------------------------------------",
			"fields": [ { "name": `${await checkBal(user.id)} mons ${emoji}`, "value": "----------------------------------------------", "inline": true } ]
		}]})
	}
}