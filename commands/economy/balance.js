const { checkBal } = require('../../utils/economyManage');
module.exports = {
	name: 'balance',
	aliases: [ 'bal', 'money', 'wallet', 'dinero', 'mons' ],
	description: 'Revisa qué tan pobre eres.',
	expectedArgs: '< @Usuario > (Opcional)',
	category: 'Economía',
	guildOnly: true,
	callback: async ({ client, message }) => {
		let user = message.mentions.users.first()
		|| message.author;
		let Mons = client.emojis.cache.get(process.env.currency)
		let bal = await checkBal(user.id)
		// message.channel.send(`> **${message.author.tag}** cuenta con: ${bal.wallet} mons ${Mons} en su billetera y ${bal.bank} ${Mons} en su cuenta bancaria.`)
		message.channel.send({embeds: [
			{
			  "color": 8734665,
			  "fields": [
				{
				  "name": "> Billetera",
				  "value": `${Mons} ${bal.wallet}`,
				  "inline": true
				},
				{
				  "name": "> Banco",
				  "value": `${Mons} ${bal.bank}`,
				  "inline": true
				}
			  ],
			  "author": {
				"name": `${user.tag}`,
				"icon_url": `${user.displayAvatarURL()}`
			  }
			}
		  ]})
	}
}