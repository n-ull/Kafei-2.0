const userSchema = require('../models/userSchema');

module.exports = {
	balance, add
}

async function balance(uid) {
	const user = await userSchema.findOneAndUpdate(
		{
			userId: uid
		},
		{
			$setOnInsert: {
				userId: uid,
				money: 0,
				bank: 0
			}
		},
		{
			upsert: true
		})

	let balance = !user ? 0 : { wallet: user.money, bank: user.bank };
	return balance
}

async function add(uid, quantity) {
	let isnum = /^\d+$/.test(quantity);
	if (quantity == 0 || !isnum) throw 'No se ingresó un número válido.';
	
	const user = await userSchema.updateOne({
		userId: uid
	}, {
		$inc: { money: quantity }
	},
		{ upsert: true })
	return 'SUCCESS'
}