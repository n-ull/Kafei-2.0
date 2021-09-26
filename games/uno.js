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

	jugada() {
		if (this.turn == this.gameContext.turn) {
			// Si es tu turno, pelotudo
		} else {
			// No es tu turno, pelotudo
		}

	}
}

class Game {
	constructor() {
		this.players = new Array();
		this.running = false;
		this.turn = 0;
		this.deck = this.shuffle(Array.from(Array(108), (_, x) => x));
		this.drawcard;
		this.graveyard;
		this.orientation = 1 // -1 orientación caNbiada
	}

	join() {
		if (this.running) this.error("GAME_RUNNING");
		if (this.players > this.maxPlayers) this.error("USERS_EXCEED");
		this.players.push(new Player("id", this.players.length, this));
	}

	/*
	*	@params {
	*		q = Quantity
	*	}
	*/
	draw(q = 1) {
		let result = [];
		if (q > this.deck.length) {
			this.deck.push(this.graveyard.pop(this.graveyard.length)).shuffle();
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
		this.running = true;

		this.players.forEach(player => {
			player.draw(7)
		});

		this.drawcard = this.deck.pop();
		return this
	}

	discard() {
		
	}

	error(message) {
		console.log(message);
	}
}

let gaming = new Game();
gaming.join();
gaming.deal();