// daily (comando de 24hs que entrega un bono diario)
const { addBal } = require('../../utils/economyManage');
module.exports = {
	name: 'daily',
	description: 'Recibe un bonus diario de 500 Mons.',
	category: 'Economía',
	cooldown: '24h',
	callback: ({ message }) => {
        addBal(message.author.id, 500);
        message.channel.send('Recibiste tu bonus diario de `500mons`. Vuelve en `24 horas` para recibirlo otra vez.');
    }
}