const userSchema = require('../models/userSchema');

module.exports.checkBal = async(userID) => {
	const user = await userSchema.findOne(
        {
            _id: userID
        })

    let wallet = !user ? 0 : user.money;
    return wallet
}

module.exports.addBal = async (userID, moneyToAdd) => {
    const user = await userSchema.updateOne({
        _id: userID
    }, {
        $inc: { money: moneyToAdd }
    },
        { upsert: true })
}

module.exports.remBal = async (userID, moneyToRem) => {
    const user = await userSchema.updateOne({
        _id: userID
    }, {
        $inc: { money: -moneyToRem }
    })
}