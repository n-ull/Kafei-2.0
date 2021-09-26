// deposit cantidad/all | deposita tu dinero en el banco
const { checkBal, deposit } = require('../../utils/economyManage');
module.exports = {
	name: 'deposit',
	aliases: [ 'depositar', 'd' ],
	description: '¡Cuida que tu dinero no sea robado por otro usuario!',
	category: 'Economy',
	guildOnly: true,
	minArgs: 1,
	expectedArgs: '< cantidad / all >',
	callback: async ({ client, message, args }) => {
		let { wallet } = await checkBal(message.author.id);
		let quantity = args[0].trim();
		let Mons = client.emojis.cache.get(process.env.currency);
        let isnum = /^\d+$/.test(quantity);

		if (wallet < args[0]){
			message.channel.send('No posees esa cantidad de dinero.')
			return
		}

		if(!isnum || quantity == 0){
            message.channel.send("Debes ingresar un número válido...")
            return
        }

		deposit(message.author.id, quantity);
		message.channel.send(`Depositaste ${quantity} ${Mons} con exito.`);

	}
}