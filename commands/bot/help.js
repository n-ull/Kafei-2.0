const { Categorias } = require('../../categories.json');
const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require('discord.js');
module.exports = {
	name: 'help',
	aliases: [ 'ayuda', 'aiuda', 'aucsilio' ],
	description: '¿En serio usaste help en help? Eres imbécil... pero si lo necesitas:',
	category: 'Bot',
	expectedArgs: '< Comando >',
	maxArgs: 1,
	callback: async ({ message, instance, args }) => {
		// Ayuda para x comando
		if (args.length == 1) {
			let select = instance.commandHandler.commands.find(x => x.names.includes(args[ 0 ]))
			if (select == undefined) {
				message.channel.send('Ese comando no existe...');
			} else {
				const helpembed = new MessageEmbed()
					.setAuthor('Kafei Bot \🦊')
					.setDescription(`Comando: **${select.names[ 0 ]}** \n ${select.description}\n`)
					.setFooter("Outlaw's Fortress", "https://i.imgur.com/I2NN2R2.gif")
					.setColor('RANDOM');
				if (select.names.length > 1) {
					helpembed.addField('**Aliases**', `\`${select.names.join(' - ')}\``)
				}
				if (select.syntax) {
					helpembed.setDescription(`Comando: **${select.names[ 0 ]}** \n > ${select.description}\n \n**Sintaxis:** \`\`\`${select.names[ 0 ]} ${select.syntax}\`\`\``)
				}
				message.channel.send({ embeds: [ helpembed ] });
			}
			return
		}

		// Ayuda general

		const filter = (interaction) => interaction.user.id === message.author.id;

		const Menu = new MessageSelectMenu()
			.setCustomId('help')
			.setPlaceholder('Selecciona una categoría...');

		Categorias.forEach(category => {
			Menu.addOptions([
				{
					label: category.name,
					description: category.description,
					value: category.id,
					emoji: category.emoji
				}
			])
		});

		const Row = new MessageActionRow()
			.addComponents(Menu);

		const embed = new MessageEmbed()
			.setAuthor('Kafei Bot 2.0 \🦊')
			.setDescription(`
	Puedes usar el comando de la siguiente manera para obtener ayuda sobre un comando en especifico: \n
	\`help <comando>\`\n
	Puedes seleccionar la categoría de comandos con el menú de abajo.
	`)
			.setColor('RANDOM')
			.setFooter("Outlaw's Fortress", 'https://i.imgur.com/I2NN2R2.gif');

		// Build page
		function buildPage(categoria, comandos, message) {
			let list = [];
			const eachCommand = comandos.filter(comando => comando.hidden !== true).forEach(element => {
				list.push(`\`${element.names[ 0 ]}\``)
			});
			const newPage = new MessageEmbed()
				.setAuthor('Kafei Bot \🦊')
				.setFooter("Outlaw's Fortress", 'https://i.imgur.com/I2NN2R2.gif')
				.setDescription('Recuerda que puedes usar `help <comando>` para obtener ayuda en un comando especifico.')
				.addField(`Comandos ${categoria.name} ${categoria.emoji}`, `${list.join(' ')}`)
				.setColor('RANDOM');

			message.edit({ embeds: [ newPage ], components: [ Row ] })

		}

		let helpDefault = await message.channel.send({ embeds: [ embed ], components: [ Row ] })
		let col = helpDefault.createMessageComponentCollector({ filter, time: 25000 });
		col.on('collect', i => {
			let categ = Categorias.find(x => x.id == i.values)
			let comandos = instance.commandHandler.commands.filter(m => m.category == i.values);
			i.deferUpdate();
			buildPage(categ, comandos, helpDefault)
			col.resetTimer()
		});

		col.on('end', () => {
			helpDefault.edit({ components: [] });
		});
	}
}