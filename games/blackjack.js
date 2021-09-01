const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
let games = new Set();
const domainpath = 'jackblack-generatior.glitch.me/v2'

class Blackjack {
	constructor(player) {
		this.deck = [];
		this.playername = player;
		this.playercards = [];
		this.playervalues = [];
		this.dealercards = [];
		this.dealervalues = [];
		this.result = 'None';
	}

	pullCard(player) {
		let keepgoing = true;
		let cardpull;
		let suits = [ '♠', '♣', '♦', '♥' ];
		if (this.deck.length < 52) {
			while (keepgoing) {
				cardpull = Math.floor(Math.random() * 52);
				keepgoing = false;
				//checks to see if that card was pulled from the deck previously
				for (let i = 0; i < this.deck.length; i++) {
					if (cardpull == this.deck[ i ]) {
						keepgoing = true;
					}
				}
			}
			this.deck.push(cardpull);
		}

		let suit = suits[ Math.floor(cardpull / 13) ];

		if (player == 0) {
			this.dealercards.push(cardpull);
			this.dealervalues.push((cardpull % 13) + 1)
		}

		if (player == 1) {
			this.playercards.push(cardpull);
			this.playervalues.push((cardpull % 13) + 1)
		}
		return this;
	}

	deal() {
		this.pullCard(0)
		this.pullCard(0)
		this.pullCard(1)
		this.pullCard(1)
		return this
	}

	score(cards) {
		let aces = 0;
		let endscore = 0;
		let comment = '';

		//count cards and check for ace
		for (let i = 0; i < cards.length; i++) {
			if (cards[ i ] == 1 && aces == 0) {
				aces++;
			} else { //if it's not an ace
				if (cards[ i ] >= 10) {
					endscore += 10;
				} else {
					endscore += cards[ i ];
				}
			}
		}

		//add ace back in if it existed
		if (aces == 1) {
			if (endscore + 11 > 21) {
				endscore++; // Hard
			} else {
				endscore += 11; // Soft
			}
		}

		return { endscore, comment };
	}

	stand() {
		// if blackjack
		if (this.playervalues.length == 2 && this.score(this.playervalues).endscore == 21) {
			if (this.score(this.dealervalues).endscore == 21) {
				this.result = 'Tie'
			} else {
				this.result = 'Win'
			}
			return this.result
		}

		while (this.score(this.dealervalues).endscore < 17) {
			this.pullCard(0);
		}

		var playerend = this.score(this.playervalues).endscore;
		var dealerend = this.score(this.dealervalues).endscore;

		if (playerend > 21) {
			this.result = 'Busted'
		} else if (dealerend > 21 || playerend > dealerend) {
			this.result = 'Win'
		} else if (dealerend == 21 && this.dealercards.length == 2) {
			this.result = 'Lose'
		} else if (dealerend == playerend) {
			this.result = 'Tie'
		} else {
			this.result = 'Lose'
		}
		return this.result
	}
}

// Función Play, encargada del envío de mensajes y el uso de botones.

module.exports.play = async (message) => {
	let player = message.author;

	if (games.has(player.id)) {
		return message.channel.send("Ya estás jugando!")
	}

	let bj = new Blackjack(player.username);

	games.add(player.id)

	try {
		const filter = (interaction) => interaction.user.id === player.id;
		bj.deal();

		function updateEmbed(options, disabled = false) {
			let updated = new MessageEmbed()
				.setAuthor(player.username, player.displayAvatarURL())
				.addField('Tus cartas: ', `\`\`\`${bj.score(bj.playervalues).comment}${bj.score(bj.playervalues).endscore}\`\`\``, true)
				.setFooter("No pierdas tu tiempo, tienes 30 segundos para decidir!");

			if (disabled) {
				let DHit = Hit.setDisabled();
				let DStand = Stand.setDisabled();
				options = new MessageActionRow()
					.addComponents([ DHit, DStand ]);
			}

			switch (bj.result) {
				case 'None':
					updated
						.addField('Dealer: ', `\`\`\`?\`\`\``, true)
						.setImage(`https://${domainpath}/${imageURL(bj.playercards, bj.dealercards, false)}`)
					gameMessage.edit({ embeds: [ updated ], components: [ options ] })
					break;
				case 'Win':
					updated
						.setAuthor(player.username, player.displayAvatarURL())
						.addField('Dealer: ', `\`\`\`${bj.score(bj.playervalues).comment}${bj.score(bj.dealervalues).endscore}\`\`\``, true)
						.setColor('#48e218')
						.setImage(`https://${domainpath}/${imageURL(bj.playercards, bj.dealercards, true)}`)
						.setFooter('Ganaste!');
					gameMessage.edit({ embeds: [ updated ], components: [ options ] })
					break;
				case 'Tie':
					updated
						.setAuthor(player.username, player.displayAvatarURL())
						.addField('Dealer: ', `\`\`\`${bj.score(bj.playervalues).comment}${bj.score(bj.dealervalues).endscore}\`\`\``, true)
						.setColor('#c78612')
						.setImage(`https://${domainpath}/${imageURL(bj.playercards, bj.dealercards, true)}`)
						.setFooter('Empate!');
					gameMessage.edit({ embeds: [ updated ], components: [ options ] })
					break;
				case 'Lose':
					updated
						.setAuthor(player.username, player.displayAvatarURL())
						.addField('Dealer: ', `\`\`\`${bj.score(bj.playervalues).comment}${bj.score(bj.dealervalues).endscore}\`\`\``, true)
						.setColor('#c71212')
						.setImage(`https://${domainpath}/${imageURL(bj.playercards, bj.dealercards, true)}`)
						.setFooter('Perdiste!');
					gameMessage.edit({ embeds: [ updated ], components: [ options ] })
					break;
				case 'Busted':
					updated
						.setAuthor(player.username, player.displayAvatarURL())
						.addField('Dealer: ', `\`\`\`${bj.score(bj.playervalues).comment}${bj.score(bj.dealervalues).endscore}\`\`\``, true)
						.setColor('#c71212')
						.setImage(`https://${domainpath}/${imageURL(bj.playercards, bj.dealercards, true)}`)
						.setFooter('Perdiste!');
					gameMessage.edit({ embeds: [ updated ], components: [ options ] })
					break;
			}
		}

		function imageURL(phand, dhand, stand = false) {
			if (stand) {
				let nomenclatura = Buffer.from(phand.join('/') + ('-') + dhand.join('/'))
					.toString('base64');
				return escape(nomenclatura);
			} else {
				let nomenclatura = Buffer.from(phand.join('/') + ('-') + dhand[ 0 ] + ('/52'))
					.toString('base64');
				return escape(nomenclatura);
			}
		}

		// Embeds and Buttons
		let Initialize = new MessageEmbed()
			.setAuthor(player.username, player.displayAvatarURL())
			.setColor('#1f1f1f')
			.addFields(
				{ name: 'Tus cartas: ', value: `\`\`\`${bj.score(bj.playervalues).comment}${bj.score(bj.playervalues).endscore}\`\`\``, inline: true },
				{ name: 'Dealer:', value: `\`\`\`?\`\`\``, inline: true }
			)
			.setImage(`https://${domainpath}/${imageURL(bj.playercards, bj.dealercards, false)}`)
			.setFooter("No pierdas tu tiempo, tienes 30 segundos para decidir!");

		let Hit = new MessageButton()
			.setCustomId('h')
			.setLabel('Hit')
			.setStyle('PRIMARY');

		let Stand = new MessageButton()
			.setCustomId('s')
			.setLabel('Stand')
			.setStyle('SECONDARY');

		let Row = new MessageActionRow()
			.addComponents([ Hit, Stand ]);

		let gameMessage = await message.channel.send({ embeds: [ Initialize ], components: [ Row ] })

		if (bj.score(bj.playervalues).endscore == 21) {
			bj.stand();
			updateEmbed(Row, true)
			return
		}

		const collector = gameMessage.createMessageComponentCollector({ filter, time: 10000 });

		collector.on('collect', i => {
			i.deferUpdate();
			if (i.customId == 'h') {
				bj.pullCard(1);
				if (bj.score(bj.playervalues).endscore >= 21) {
					collector.stop();
					bj.stand()
					return updateEmbed(Row, true)
				}
				updateEmbed(Row)
			} else {
				collector.stop();
				bj.stand();
				updateEmbed(Row, true)
			}
		});

		collector.on('end', (c, r) => {
			if (r == 'time') {
				bj.stand();
			}
			games.delete(player.id)
		})
	} catch (error) {
		console.log(error)
	}
}