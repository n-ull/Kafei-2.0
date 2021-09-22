const userSchema = require('../../models/userSchema');
const economy = require('../../utils/economyManage');
module.exports = {
	name: 'give',
	aliases: ['donar', 'pay', 'pagar'],
	description: 'Dale dinero a otro usuario, no des mucho, las ratas son malagradecidas.',
	category: 'Economy',
	expectedArgs: '< @Usuario > < Cantidad >',
	guildOnly: true,
	callback: async ({message, args}) => {
		let target = message.mentions.users.first()
        let quantity = args[1].trim();
        let isnum = /^\d+$/.test(quantity);

		if(!target){
            message.channel.send("No especificaste un usuario.")
            return
        }

        if(target == message.author.id){
            message.channel.send("No te puedes dar dinero a ti mismo.")
            return
        }

        if(target.bot){
            message.channel.send("¡Eso es un bot!");
            return
        }

		if(!isnum || quantity == 0){
            message.channel.send("Debes ingresar un número válido... Ejemplo: `-give @usuario 1000`")
            return
        }

		let contributor = await userSchema.findOne({userId: message.author.id});
        let contributed = await userSchema.findOne({userId: target.id});

		if(contributor.money < quantity) {
            message.channel.send("No posees suficiente dinero...")
            return
        } else {
            economy.addBal(target.id, quantity);
            economy.remBal(message.author.id, quantity);
            message.channel.send(`Enviaste $${quantity} a <@${target.id}>`)
        }
	}
}