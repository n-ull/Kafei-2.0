class Player {
	constructor(id, index, game) {
		this.id = id;
		this.gameContext = game;
		this.hand = [];
		this.turn = index;
	}

	giveUp() {

	}

	draw(q) {
		this.hand.push(...this.gameContext.draw(q))
	}

	play(on, card) {
		if (this.turn == this.gameContext.turn) {
			switch (on) {
				case 'draw':
					this.draw(1)
					this.gameContext.nextTurn();
					break;
				case 'drop':
					this.hand = this.hand.filter(hand => hand !== card);
					this.gameContext.use(card, 0);
					break;
			}
		} else {
			this.gameContext.error('NOT_YOUR_TURN')
		}
	}

	getOptions() {
		if (this.turn !== this.gameContext.turn) return this.gameContext.error('NOT_YOUR_TURN');
		this.hand.forEach(card => {
			card.evaluate(this.gameContext.graveyard[ this.gameContext.graveyard.length - 1 ])
		});
	}
}

class Card {
	constructor(index) {
		if (index > 99) {
			this.type = 'joker'
			this.effectId = index % 2
			return
		}

		if ((index % 25) >= 19) {
			this.type = 'effect'
			this.effectId = index % 3;
		}

		if ((index % 25) > 9 && (index % 25) < 19) {
			this.value = (index % 25) - 9;
		} else {
			this.value = index % 25;
		}

		this.color = Math.floor(index / 25);
	}

	evaluate(topcard) {
		if (this.type == 'joker') {
			return true
		}

		if (this.color == topcard.color || this.value == topcard.value) {
			return true
		}

		return false
	}
}

class Game {
	constructor() {
		this.players = new Array();
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
		if (this.players.length == this.maxPlayers) return this.error("USERS_EXCEED");
		this.players.push(new Player(id, this.players.length, this));
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
		if (this.players.length == this.minPlayers) return this.error('NOT_ENOUGH_PLAYERS')

		this.players.forEach(player => {
			player.draw(7)
		});

		// Shuffle the cards until the last is not a joker
		while (this.deck[ this.deck.length - 1 ].type == 'joker') {
			this.shuffle(this.deck);
		}

		this.graveyard.push(this.deck.pop());
		this.running = true;
		return this
	}

	// jump a turn
	nextTurn() {
		let outOfBound = this.turn + this.orientation;
		if (outOfBound < 0) {
			return this.turn = this.players.length
		}

		return this.turn = this.turn + this.orientation;
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
	use(card, param) {
		let target = (this.turn + this.orientation) < 0 ? this.players.length : this.turn + this.orientation;
		if (card.type == 'joker') {
			card.color = param;
			if (card.effectId == 0) {
				this.players[ target ].draw(4);
			}
		}

		if (card.type == 'effect') {
			switch (card.effectId) {
				case 0:
					this.players[ target ].draw(2);
					break;
				case 1:
					this.turn = this.target;
					break;
				case 2:
					if(this.orientation == 1) {
						this.orientation = -Math.abs(this.orientation)
					} else {
						this.orientation = Math.abs(this.orientation)
					}
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

let gaming = new Game();

