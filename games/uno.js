Array.prototype.shuffle = function () {
	var i = this.length, j, temp;
	if (i == 0) return this;
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		temp = this[ i ];
		this[ i ] = this[ j ];
		this[ j ] = temp;
	}
	return this;
}

class Uno {
	constructor(players) {
		this.result = 'None';
		this.players = players;
		this.deck = Array.from(Array(108), (_, x) => x).shuffle();
		this.drawcard;
		this.graveyard = [];
	}

	draw(p, q = 1) {
		if (q > this.deck.length) {
			this.deck.push(this.graveyard.pop(this.graveyard.length)).shuffle();
		}

		for (let cards = 0; cards < q; cards++) {
			let drawed = this.deck.pop();
			this.players[ p ].hand.push(drawed)
		}

		return this
	}

	deal() {
		for (let index = 0; index < this.players.length; index++) {
			const player = this.players[ index ];
			this.draw(index, 7);
		}

		this.drawcard = this.deck.pop();
		return this
	}

	discard(card) {
		let color = n => Math.floor(n / 25);
		let value = n => n > 100 ? 'comodin' :
			(n % 25) > 9 && (n % 25) < 18 ? (n % 25) - 9 : 'efecto';

		if (color(card) !== color(this.drawcard) || value(card) !== value(drawcard)) {
			// la carta lanzada no tiene el mismo color ni valor
		}
	}

	evaluate(card) {
		let number = (card % 25);
		let result = {}
		if (card > 100) {
			// Joker
			result = {
				type: "effect",
				color: null,
				value: null,
				effect: ()=>{

				}
			}
		} else if (number > 17) {
			// Effect
		}
		else if (number > 9) {
			// Number 2nd Pair
		} else {
			// Number (0-9)
			result = {
				type: "normal",
				value: number,
				color: card / 25
			}
		}
		return result;
	}
}

// Player Object
let playing = [ {
	id: "852739032923635773",
	hand: []
}, {
	id: "244535132097216512",
	hand: []
} ]

let game = new Uno(playing).deal();
console.log(game)
