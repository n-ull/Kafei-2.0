const economy = require('../../utils/economyManage');
const clans = require('../../utils/clansManage');
const { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js')
let using = new Set();

module.exports = {
	name: 'buy',
	description: 'Compra un clan, por el accesible precio de tu alma.',
	category: 'Clans',
	guildOnly: true,
	callback: async ({ message }) => {
		let member = message.member;
		let cost = 1500000;
		let wallet = await economy.checkBal(member.id);
		let clan = {};
		let step = 1;

		if (using.has(message.author.id)) {
			message.channel.send('Ya iniciaste el proceso de creación de clanes, sigue las instrucciones o vuelve a intentar en un 5 minutos.');
			return
		}

		if (await clans.hasClan(member.id, message.guildId)) {
			message.channel.send(`Ya posees un clan... No seas codicioso, solo puedes tener uno.`)
			return
		}

		if (wallet < cost) {
			message.channel.send(`No cuentas con suficiente dinero, te faltan ${cost - wallet} Mons`);
			return
		} else {
			using.add(message.author.id)
			let embedConfig = new MessageEmbed()
				.setTitle('(Paso 1) 🎌')
				.setDescription("Parece que ya estás preparado para tener tu propio clan. A continuación indica el nombre de tu clan (Máximo 12 caracteres).\n\n**Nombre del Clan:** ◀\n>  . . . . . . . . . . .\n\n**Icono**:\n> . . . .\n\n**Color:**\n> . . . .")
				.setColor('794fff')
				.setFooter('⚠ Cualquier clan que incumpla las normas será eliminado y no se reembolsará.');

			let accept = new MessageButton()
				.setCustomId('accept')
				.setLabel('Aceptar')
				.setDisabled(true)
				.setStyle('SUCCESS');

			let cancel = new MessageButton()
				.setCustomId('cancel')
				.setLabel('Cancelar')
				.setStyle('DANGER');

			let Menu = new MessageActionRow()
				.addComponents([ accept, cancel ]);

			let config = await message.channel.send({ embeds: [ embedConfig ], components: [ Menu ] })

			let filter = (interaction) => interaction.user.id === message.author.id;

			const btnCol = config.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 60000 });
			const msgCol = config.channel.createMessageCollector({ time: 60000 })

			btnCol.on('collect', async i => {
				await i.deferUpdate();
				if(i.customId == 'cancel'){
					msgCol.stop();
					btnCol.stop();
				}
			});

			btnCol.on('end', () => {
				config.edit({embeds: [    {
					"title": "⚠  Creación de clanes cancelada...",
					"description": "Vuelve cuando estés preparado, cobarde...",
					"color": 15743803
				  }], components: []})
				using.delete(message.author.id);
			})

			msgCol.on('collect', i => {
				if (i.author.id !== message.author.id) {
					console.log('Recibido mensaje de otro usuario')
					return
				}

				switch (step) {
					case 1:
						if (i.content.length > 12) {
							i.reply({ content: 'El nombre de tu clan no debe superar los 12 caracteres y no debe tener emojis', ephemeral: true });
							msgCol.resetTimer()
							return
						}
						clan.name = i.content;
						step++;
						embedConfig.setTitle('(Paso 2) 🎌')
							.setDescription(
								`A continuación deberás enviarme un emoji, no puede ser un emoji personalizado, solo aceptaré emojis oficiales de Discord, **exceptuando las banderas**.\n\n**Nombre del Clan:** \n> ${clan.name}\n\n**Icono**: ◀\n> . . . .\n\n**Color:**\n> . . . .`
							);
						config.edit({ embeds: [ embedConfig ] });
						break;
					case 2:
						step++;
						console.log(i.content);
						break;
					case 3:
						console.log('Paso 3')
						break;
				}
			});

		}
	}
}