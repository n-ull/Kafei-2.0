// deposit cantidad/all | deposita tu dinero en el banco
const { checkBal, withdraw } = require('../../utils/economyManage');
module.exports = {
	name: 'withdraw',
	aliases: [ 'extraer', 'w' ],
	description: '¿Necesitas gastar un poco en el casino?',
	category: 'Economy',
	guildOnly: true,
	minArgs: 1,
	expectedArgs: '< cantidad / all >',
	callback: async ({ client, message, args }) => {
		let { bank } = await checkBal(message.author.id);
		let quantity = args[0].trim();
		let Mons = client.emojis.cache.get(process.env.currency);
        let isnum = /^\d+$/.test(quantity);

		if (bank < args[0]){
			message.channel.send('No posees esa cantidad de dinero en tu banco.')
			return
		}

		if(!isnum || quantity == 0){
            message.channel.send("Debes ingresar un número válido...")
            return
        }

		withdraw(message.author.id, quantity);
		message.channel.send(`Extraiste ${quantity} ${Mons} con exito.`);

	}
}