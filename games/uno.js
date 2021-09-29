let { Collection, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js')
let Emojis = require('./unoEmojis');

class Player {
	constructor(id, name, index, game) {
		this.id = id;
		this.name = name
		this.gameContext = game;
		this.hand = new Map();
		this.position = index;
	}


	draw(q) {
		let cards = this.gameContext.draw(q)
		for (let index = 0; index < cards.length; index++) {
			const card = cards[ index ];
			this.hand.set(card.id, card);
		}
	}

	turn() {
		return this.position == this.gameContext.turn;
	}

	play(on, card, param) {
		if (this.position == this.gameContext.turn) {
			switch (on) {
				case 'draw':
					this.draw(1)
					this.gameContext.nextTurn();
					break;
				case 'drop':
					let select = this.hand.get(card);
					if (select == undefined) return this.gameContext.error('NOT_IN_HAND');
					if (this.hand.size - 1 == 0) {
						this.gameContext.finish();
					}
					this.hand.delete(card);
					this.gameContext.use(select, param);
					break;
			}
		} else {
			this.gameContext.error('NOT_YOUR_TURN')
		}
	}

	/**
	 * @returns {Array} Every possible card to play
	 */
	getHand() {
		let top = this.gameContext.last();
		let cardsArray = Array.from(this.hand.values());
		return cardsArray.filter(c => c.value == top.value || c.color == top.color || c.type == 'wild');
	}
}

class Card {
	constructor(index) {
		this.id = `🃏${index}`
		if (index > 99) {
			this.type = 'wild';
			this.color = 'W';
			this.effectId = index % 2;
			this.value = [ 'WILD+4', 'WILD' ][ this.effectId ];
			return
		}

		if ((index % 25) >= 19) {
			this.type = 'effect';
			this.effectId = index % 3;
			this.value = [ '+2', 'REVERSE', 'SKIP' ][ this.effectId ];
			this.color = [ 'R', 'G', 'B', 'Y' ][ Math.floor(index / 25) ];
			return
		}

		if ((index % 25) > 9 && (index % 25) < 19) {
			this.value = (index % 25) - 9 + '';
		} else {
			this.value = index % 25 + '';
		}

		this.color = [ 'R', 'G', 'B', 'Y' ][ Math.floor(index / 25) ];
	}

	wild() {
		return this.type == 'wild' ? true : false
	}

	get emojiMap() {
		return this.wild() ? this.value.replace('+', 'PLUS') : `${this.color + this.value.replace('+', 'PLUS')}`
	}

	get colorName() {
		return {
			R: 'Rojo',
			Y: 'Amarillo',
			G: 'Verde',
			B: 'Azul'
		}[ this.color ];
	}

	get colorCode() {
		return {
			R: 0xff5555,
			Y: 0xffaa00,
			G: 0x55aa55,
			B: 0x5555ff
		}[ this.color ] || 0x080808;
	}

	get colorEmoji() {
		return {
			R: '🔴',
			Y: '🟡',
			G: '🟢',
			B: '🔵',
			W: '🔳'
		}[ this.color ]
	}

	get cardURL() {
		return `https://raw.githubusercontent.com/Ratismal/UNO/master/cards/${this.wild() ? '' : this.color}${this.value}.png`;
	}
}

class Game {
	constructor() {
		this.players = new Collection();
		this.running = false;
		this.turn = 0;
		this.deck = this.shuffle(Array.from(Array(108), (_, x) => new Card(x)));
		this.maxPlayers = 8;
		this.minPlayers = 0;
		this.graveyard = [];
		this.orientation = 1; // -1 orientación caNbiada
		this.finished = false;
	}

	join(id, name) {
		if (this.running) return this.error("GAME_RUNNING");
		if (this.players.size == this.maxPlayers) return this.error("USERS_EXCEED");
		if (this.players.has(id)) return this.error('ALREADY_JOINED');
		this.players.set(id, new Player(id, name, this.players.size, this));
	}

	/** 
	 * @param {number} q Cantidad de cartas a levantar
	 * @returns {Array} Cartas levantadas
	 */
	draw(q = 1) {
		let result = [];
		if (q > this.deck.length) {
			this.mulligan();
		}

		for (let cards = 0; cards < q; cards++) {
			let drawed = this.deck.pop();
			result.push(drawed);
		}

		return result
	}

	shuffle(deck) {
		var i = deck.length, j, temp;
		if (i == 0) return deck;
		while (--i) {
			j = Math.floor(Math.random() * (i + 1));
			temp = deck[ i ];
			deck[ i ] = deck[ j ];
			deck[ j ] = temp;
		}
		return deck;
	}


	deal() {
		if (this.running == true) return this.error('GAME_RUNNING')
		if (this.players.size == this.minPlayers) return this.error('NOT_ENOUGH_PLAYERS')

		this.players.forEach(player => {
			player.draw(7)
		});

		// Shuffle the cards until the last is not a joker
		while (this.deck[ this.deck.length - 1 ].type == 'wild') {
			this.shuffle(this.deck);
		}

		this.graveyard.push(this.deck.pop());
		this.running = true;
	}

	// jump a turn
	nextTurn(know = false) {
		let outOfBound = this.turn + this.orientation;
		let next = 0;
		if (outOfBound < 0) {
			next = this.players.size - 1
		} else if (outOfBound > (this.players.size - 1)) {
			next = 0
		} else {
			next = this.turn + this.orientation
		}

		if (know) {
			return next
		}

		return this.turn = next;
	}

	// returns the graveyard (except the last card) into the deck for reusing it
	mulligan() {
		let move = this.graveyard.splice(0, this.graveyard.length - 1);
		this.shuffle(this.deck.push(...move))
	}

	/**
	 * 
	 * @param {Object} card The Card Object after being evaluated.
	 * @param {number} param The selected color (R/G/B/Y)
	 */
	use(card, param = 'R') {
		let target = this.players.find(p => p.position == this.nextTurn(true));
		if (card.type == 'wild') {
			card.color = param;
			switch (card.effectId) {
				case 0:
					this.nextTurn();
					target.draw(4)
					// sumar +4 al usuario del siguiente turno			
					break;
			}
		}

		if (card.type == 'effect') {
			// console.log(`Efecto activado: ${{ 0: '+2', 1: 'REV', 2: 'SKIP' }[ card.effectId ]}`);
			switch (card.effectId) {
				case 0:
					target.draw(2)
					this.nextTurn();
					// sumar +2 al usuario del siguiente turno
					break;
				case 1:
					if (this.orientation == 1) {
						this.orientation = -1
					} else {
						this.orientation = 1
					}
					break;
				case 2:
					this.nextTurn();
					// saltar turno
					break;
			}
		}

		this.graveyard.push(card);
		this.nextTurn();
	}

	error(message) {
		console.log(message);
	}

	last() {
		return this.graveyard[ this.graveyard.length - 1 ]
	}

	finish() {
		this.finished = true;
	}
}

// Buttons and Menus
let JoinButton = new MessageButton().setStyle('SUCCESS').setCustomId('join').setLabel('Join');
let StartButton = new MessageButton().setStyle('SECONDARY').setCustomId('start').setLabel('Start');
let MainMenu = new MessageActionRow().addComponents(JoinButton, StartButton);

let HandButton = new MessageButton().setStyle('SECONDARY').setCustomId('hand').setLabel('Hand');
let gameOptions = new MessageActionRow().addComponents(HandButton);

let RED = new MessageButton().setStyle('SECONDARY').setCustomId('R').setEmoji('🔴')
let GREEN = new MessageButton().setStyle('SECONDARY').setCustomId('G').setEmoji('🟢')
let YELLOW = new MessageButton().setStyle('SECONDARY').setCustomId('Y').setEmoji('🟡')
let BLUE = new MessageButton().setStyle('SECONDARY').setCustomId('B').setEmoji('🔵')
let WildMenu = new MessageActionRow().addComponents(RED, BLUE, YELLOW, GREEN);

//@TODO: No se puede ganar con cartas de efecto!

module.exports = async (message) => {
	let EmojiMap = Emojis(message.client);
	// Embeds
	let InitialEmbed = new MessageEmbed()
		.setAuthor('UNO!', 'https://cdn.discordapp.com/avatars/403419413904228352/23d64a552dd7984cd1163afcc75ce297.webp?size=128')
		.setTitle('¡Unete a la partida!')
		.setFooter('Reglas del juego');
	let PlayingEmbed = new MessageEmbed()
		.setAuthor('UNO!', 'https://cdn.discordapp.com/avatars/403419413904228352/23d64a552dd7984cd1163afcc75ce297.webp?size=128');
	let ScoreEmbed = new MessageEmbed()
		.setTitle('¡El juego terminó!');

	function updateEmbed(action, embed, info, played) {
		// let playerlist = Array.from(info.players.values());
		let step1 = info.players.mapValues(p => p);
		let step2 = Array.from(step1.values());
		let playerlist = [];
		let turns = [];
		step2.forEach(p => playerlist.push(`- ${p.name}\n`));
		step2.forEach(p => {
			if (p.turn()) {
				turns.push(`# ${p.name} (${p.hand.size} cartas)\n`);
			} else {
				turns.push(`- ${p.name} (${p.hand.size} cartas)\n`);
			}
		});
		let playmsg = [ 'lanzó una carta', 'levantó una carta', 'levantó una carta y la lanzó' ]

		if (action == 'join') {
			embed.setDescription(`Presiona el botón \`Join\` para ingresar a la partida.\n
	[ **Jugadores** ]\n\`\`\`md\n${playerlist.join('')}\`\`\``);
		}

		if (action == 'play') {
			// ? playerlist.push(`# ${p.name}\n`) : playerlist.push(`- ${p.name}`
			embed.setTitle(`Última carta tirada: ${info.last().value}  ${info.last().colorName}`)
				.setDescription(`
	El jugador <@${played.id}> ${playmsg[ played.m ]}.\n
	[ **Jugadores** ]\n\`\`\`md\n${turns.join('')}\`\`\`
	`)
				.setColor(info.last().colorCode)
				.setThumbnail(info.last().cardURL);
		}

		if (action == 'start') {
			embed.setTitle(`La primera carta es: ${info.last().value} ${info.last().colorName}`)
				.setDescription(`
	Empezó el juego, es hora de sufrir!.\n
	[ **Jugadores** ]\n\`\`\`md\n${turns.join('')}\`\`\`
	`)
				.setColor(info.last().colorCode)
				.setThumbnail(info.last().cardURL);
		}

		if (action == 'finish') {
			embed.setDescription(`Acaba de ganar <@${played.id}>`)
				.setThumbnail(info.last().cardURL)
				.setColor(info.last().colorCode);
		}
	};

	// Initialize all the utils and the game
	let game = new Game();
	let cacheCard;

	game.join(message.author.id, message.author.username)
	updateEmbed('join', InitialEmbed, game);

	// Send the first message and listen to join and start
	let thread = await message.startThread({ name: 'UNO! [001]', autoArchiveDuration: 60 });
	let stepOne = await thread.send({ embeds: [ InitialEmbed ], components: [ MainMenu ] });
	let filter2 = i => i.channel.id == thread.id;
	let firstCol = stepOne.channel.createMessageComponentCollector({ filter2 });


	firstCol.on('collect', async option => {
		if (!game.players.has(option.user.id) && game.running) return;
		try {
			if (option.customId == 'join') {
				await option.deferUpdate();
				game.join(option.user.id, option.user.username);
				updateEmbed('join', InitialEmbed, game)
				stepOne.edit({ embeds: [ InitialEmbed ] })
			}

			if (option.customId == 'start') {
				await option.deferUpdate();
				game.deal();
				updateEmbed('start', PlayingEmbed, game)
				stepOne.edit({ embeds: [ PlayingEmbed ], components: [ gameOptions ] });
			}

			if (option.customId == 'hand' && !game.players.get(option.user.id).turn()) {
				function getFullHand(id) {
					let fullhand = [];
					game.players.get(id).hand.forEach(c => {
						// console.log(c.emojiMap)
						fullhand.push(EmojiMap.find(e => e.name == c.emojiMap));
					})
					return !fullhand ? '[Sin cartas]' : fullhand.join(' ')
				}

				await option.deferReply({ ephemeral: true });
				option.editReply({ content: `${getFullHand(option.user.id)}`, ephemeral: true });
				return
			}

			if (option.customId == 'hand' && game.players.get(option.user.id).turn()) {
				let player = game.players.get(option.user.id);
				let filter = i => i.user.id == player.id;
				await option.deferReply({ ephemeral: true });

				// Create turn hand
				let possible = player.getHand();

				let HandCards = new MessageSelectMenu().setCustomId('play').setPlaceholder('Selecciona qué carta tirar...').addOptions({
					label: 'Levantar carta',
					description: 'Levanta una carta y pasa turno (tirala de ser posible)',
					value: 'draw',
					emoji: '🎴'
				});
				let HandMenu = new MessageActionRow();

				possible.forEach(card => {
					HandCards.addOptions({
						label: `${card.value}`,
						description: `Lanza esta carta, está disponible!`,
						value: card.id,
						emoji: card.colorEmoji
					})
				})

				function getFullHand(player) {
					let fullhand = [];
					player.hand.forEach(c => {
						// console.log(c.emojiMap)
						fullhand.push(EmojiMap.find(e => e.name == c.emojiMap));
					})
					return !fullhand ? '[Sin cartas]' : fullhand.join(' ')
				}

				HandMenu.addComponents(HandCards);
				option.editReply({ content: `${getFullHand(player)}`, ephemeral: true, components: [ HandMenu ] });

				// Collect player selection
				let secCol = option.channel.createMessageComponentCollector({ filter, time: 30000 });
				secCol.on('collect', async selection => {
					if (!player.turn()) return selection.reply({ content: '¡No puedes enviar cartas si no es tu turno!', ephemeral: true });

					if (selection.customId == 'hand') {
						secCol.stop()
						option.editReply({ content: 'Volviste a tocar Hand', ephemeral: true, components: [], embeds: [] });
						return
					}
					selection.deferUpdate();
					if (selection.customId == 'R' || selection.customId == 'B' || selection.customId == 'Y' || selection.customId == 'G') {
						player.play('drop', cacheCard, selection.customId);

						option.editReply({ content: `${getFullHand(player)}`, ephemeral: true, components: [] });
						updateEmbed('play', PlayingEmbed, game, { id: option.user.id, m: 0 });
						stepOne.channel.send({ embeds: [ PlayingEmbed ], components: [ gameOptions ] });
						secCol.stop();
						return
					}

					if (selection.values == 'draw') {
						player.play('draw');

						option.editReply({ content: `${getFullHand(player)}`, ephemeral: true, components: [] });
						updateEmbed('play', PlayingEmbed, game, { id: option.user.id, m: 1 });
						stepOne.channel.send({ embeds: [ PlayingEmbed ], components: [ gameOptions ] });
					}

					if (selection.values.join().startsWith('🃏')) {
						if (player.hand.get(selection.values[ 0 ]).wild()) {
							cacheCard = selection.values[ 0 ];
							option.editReply({ content: `¿Qué color quieres?`, ephemeral: true, components: [ WildMenu ] })
							return
						} else {
							player.play('drop', selection.values[ 0 ])

						}
						if (game.finished) {
							updateEmbed('finish', ScoreEmbed, game, { id: option.user.id });
							thread.parent.send({ embeds: [ ScoreEmbed ], components: [] })
							thread.delete();
							firstCol.stop();
							return
						}
						option.editReply({ content: `${getFullHand(player)}`, ephemeral: true, components: [] });
						updateEmbed('play', PlayingEmbed, game, { id: option.user.id, m: 0 });
						stepOne.channel.send({ embeds: [ PlayingEmbed ], components: [ gameOptions ] });
					}
					secCol.stop();
				})

			}

			firstCol.on('end', (_, r) => {

			})
		}
		catch (err) {
			console.log(err);
		}
	})
}
