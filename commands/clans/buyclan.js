const economy = require('../../utils/economyManage');
const clans = require('../../utils/clansManage');
const { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js')
let using = new Set();

module.exports = {
	name: 'buyclan',
	description: 'Compra un clan, por el accesible precio de tu alma... Es broma, no aceptamos basura, crear un clan cuesta 1.500.000 Mons.',
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
				if (i.customId == 'cancel') {
					step = 0
					msgCol.stop();
					btnCol.stop();
				}

				if(i.customId == 'accept'){
					if(step == 4){
						embedConfig.setTitle('Tu clan fue creado')
						.setDescription(`
						Felicidades, ahora eres dueño del clan ${clan.name}, te quitamos tu anterior clan y te dimos el tuyo, para ver las opciones del clan usa el comando: \`-configclan\`
						`)
						.setColor('GREEN');
						clans.create(message.guild, message.member, clan)
						config.edit({embeds: [embedConfig], components: []});
						msgCol.stop();
						btnCol.stop();
					}
				}
			});

			btnCol.on('end', (c, r) => {
				if(step == 0 || r == 'time') {
					config.edit({
						embeds: [ {
							"title": "⚠  Creación de clanes cancelada...",
							"description": "Vuelve cuando estés preparado, cobarde...",
							"color": 15743803
						} ], components: []
					})
				}
				using.delete(message.author.id);
			})

			msgCol.on('collect', i => {
				if(i.author.id !== message.author.id) return;
				switch (step) {
					case 1:
						if (i.content.length > 12) {
							i.reply({ content: 'El nombre de tu clan no debe superar los 12 caracteres y no debe tener emojis' });
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
						clan.emoji = i.content;
						step++;
						embedConfig.setTitle('(Paso 3) 🎌')
							.setDescription(
								`Perfecto, ahora envíame un color en hexadecimal o alguno de los siguientes: \`\`\`RED, BLUE, GREEN, PURPLE, BLURPLE, PINK, ORANGE, CYAN, GOLDEN, YELLOW, GRAY\`\`\`\n\n**Nombre del Clan:** \n> ${clan.name}\n\n**Icono**: \n> ${clan.emoji}\n\n**Color:** ◀\n> . . . .`
							)
						config.edit({ embeds: [ embedConfig ] })
						break;
					case 3:
						clan.color = i.content;
						step++;
						embedConfig.setTitle('¿Estás seguro?')
						.setDescription(
							`Estos son los datos que me enviaste, si estás seguro puedes aceptar y ya tendrás tu clan, y si no puedes cancelar y volver a intentarlo. Se puede cambiar luego de crear el clan, pero te costará unos Mons extra... así que piensa bien.\n\n**Nombre del Clan:** \n> ${clan.name}\n\n**Icono**: \n> ${clan.emoji}\n\n**Color:** \n> ${clan.color}`
						);
						accept.setDisabled(false);
						config.edit({embeds: [embedConfig], components: [new MessageActionRow().addComponents([accept, cancel])]})
						break;
				}
			});

		}
	}
}