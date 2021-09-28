let { Collection, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js')

class Player {
	constructor(id, index, game) {
		this.id = id;
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

	play(on, card) {
		if (this.position == this.gameContext.turn) {
			switch (on) {
				case 'draw':
					this.draw(1)
					this.gameContext.nextTurn();
					break;
				case 'drop':
					let select = this.hand.get(card);
					if (select == undefined) return this.gameContext.error('NOT_IN_HAND');
					this.hand.delete(card);
					this.gameContext.use(select);
					break;
			}
		} else {
			this.gameContext.error('NOT_YOUR_TURN')
		}
	}

	getHand() {
		let top = this.gameContext.graveyard[ this.gameContext.graveyard.length - 1 ];
		let cardsArray = Array.from(this.hand.values());
		return cardsArray.filter(c => c.value == top.value || c.color == top.color || c.type == 'joker');
	}
}

class Card {
	constructor(index) {
		this.id = `🃏${index}`
		if (index > 99) {
			this.type = 'joker'
			this.value = 'joker'
			this.effectId = index % 2
			return
		}

		if ((index % 25) >= 19) {
			this.type = 'effect'
			this.value = 'effect'
			this.effectId = index % 3;
		}

		if ((index % 25) > 9 && (index % 25) < 19) {
			this.value = (index % 25) - 9;
		} else {
			this.value = index % 25;
		}

		this.color = Math.floor(index / 25);
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
		this.orientation = 1 // -1 orientación caNbiada
	}

	join(id) {
		if (this.running) return this.error("GAME_RUNNING");
		if (this.players.size == this.maxPlayers) return this.error("USERS_EXCEED");
		if (this.players.has(id)) return this.error('ALREADY_JOINED');
		this.players.set(id, new Player(id, this.players.size, this));
	}

	/**
	 * 
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
		while (this.deck[ this.deck.length - 1 ].type == 'joker') {
			this.shuffle(this.deck);
		}

		this.graveyard.push(this.deck.pop());
		this.running = true;
	}

	// jump a turn
	nextTurn(know = false) {
		let outOfBound = this.turn + this.orientation;
		let next;
		if (outOfBound < 0) {
			next = this.players.size
		}

		if (outOfBound > (this.players.size - 1)) {
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
	 * @param {number} param The selected color (0/1/2/3)
	 */
	use(card, param = 0) {
		let target = this.players.find(p => p.position == this.nextTurn(true));
		if (card.type == 'joker') {
			card.color = param;
			switch (card.effectId) {
				case 0:
					target.draw(4)
					// sumar +4 al usuario del siguiente turno			
					break;
			}
		}

		if (card.type == 'effect') {
			switch (card.effectId) {
				case 0:
					target.draw(2)
					// sumar +2 al usuario del siguiente turno
					break;
				case 1:
					this.nextTurn();
					// adelantar un turno
					break;
				case 2:
					// alternar orientación
					this.orientation = this.orientation == 1 ? -1 : 1;
					break;
			}
		}

		this.graveyard.push(card);
		this.nextTurn();
	}

	error(message) {
		console.log(message);
	}
}

module.exports = async (message, client) => {
	let game = new Game();
	
	let joinbutton = new MessageButton()
		.setCustomId('JOIN')
		.setLabel('Join UNO!')
		.setStyle('PRIMARY');

	let start = new MessageButton()
		.setCustomId('START')
		.setLabel('Start')
		.setStyle('SECONDARY');

	let hand = new MessageButton()
		.setCustomId('HAND')
		.setLabel('Hand')
		.setStyle('SECONDARY');

	let join = new MessageActionRow().addComponents(joinbutton, start);
	let options = new MessageActionRow().addComponents(hand)

	let Init = await message.channel.send({ content: 'Join the game!', components: [ join ] });
	Init.startThread({ name: `Partida de UNO! #${game.id}`, autoArchiveDuration: 60, reason: `Partida iniciada por ${message.author.tag}` })

	client.on('interactionCreate', async interaction => {
		if (interaction.channelId == thread.id) {
			if (interaction.customId == 'JOIN') {
				await interaction.deferReply({ ephemeral: true });
				if (playing.has(interaction.user.id)) return interaction.editReply('Ya ingresaste a la partida')
				game.join(interaction.user.id);
				playing.add(interaction.user.id);
				interaction.editReply('Ingresaste a la partida');
			}
			if (interaction.customId == 'START') {
				await interaction.deferReply({ ephemeral: true });
				interaction.editReply('Presiona `Mano` para ver tus opciones.');
				game.deal();
				thread.send({ content: `El juego comenzó con un ${game.graveyard[ game.graveyard.length - 1 ].value}`, components: [ options ] })
			}
			if (interaction.customId == 'HAND') {
				let player = game.players.get(interaction.user.id);
				await interaction.deferReply({ ephemeral: true });
				// Hand Menu Options
				let avaliableCards = new MessageSelectMenu()
					.setCustomId('PLAY')
					.addOptions({
						label: 'Draw',
						description: 'Draw a card.',
						value: 'draw',
						emoji: '🎴'
					})
					.setPlaceholder('¿Qué harás?');

				let manita = player.getHand();
				manita.forEach(card => {
					avaliableCards.addOptions({
						label: 'Carta',
						description: `Valor: ${card.value}`,
						value: `${card.id}`,
						emoji: '890649044144255038'
					})
				})


				if (!player.turn()) {
					avaliableCards.setPlaceholder('No es tu turno.')
					avaliableCards.setDisabled(true)
				}

				let handMenu = new MessageActionRow().addComponents(avaliableCards);

				interaction.editReply({ content: 'Tu mano es... ', components: [ handMenu ] });
			}
			if (interaction.customId == 'PLAY') {
				let player = game.players.get(interaction.user.id);
				await interaction.deferReply({ephemeral: true});
				if(!player.turn()) return interaction.editReply('¡No es tu turno!');

				if (interaction.values.filter(a => a.startsWith('🃏')).length) {
					// @todo: if player send a card he doesn't has return error message reply.
					player.play('drop', interaction.values[ 0 ]);
					thread.send({ content: `La nueva carta es ${game.graveyard[ game.graveyard.length - 1 ].value}`, components: [options] })
					interaction.editReply({ content: "Tienes una nueva mano", components: [] });
				}

				if (interaction.values == 'draw') {
					player.play('draw');
					interaction.editReply({ content: "Tienes una nueva mano", components: [] });
				}
			}
		}
	})
}
