const economy = require('../../utils/economyManage');
const clans = require('../../utils/clansManage');

module.exports = {
	name: 'buy',
	description: 'Compra un clan, por el accesible precio de tu alma.',
	category: 'Clanes',
	guildOnly: true,
	callback: async ({ message }) => {
		let member = message.member;
		let cost = 1500000;
		let wallet = await economy.checkBal(member.id);

		if(await clans.hasClan(member.id, message.guildId)){
			message.channel.send(`Ya posees un clan... No seas codicioso, solo puedes tener uno.`)
			return
		}

		if(wallet < cost){
			message.channel.send(`No cuentas con suficiente dinero, te faltan ${cost - wallet} Mons`);
			return
		} else {
			message.channel.send('Configuración para creación de clanes no terminada...')
		}
	}
}