const userSchema = require('../models/userSchema');

module.exports.checkBal = async (userID) => {
    const user = await userSchema.findOneAndUpdate(
        {
            userId: userID
        },
        {
            $setOnInsert: {
                userId: userID,
                money: 0
            }
        },
        {
            upsert: true
        })

    let wallet = !user ? 0 : user.money;
    return wallet
}

module.exports.addBal = async (userID, moneyToAdd) => {
    const user = await userSchema.updateOne({
        userId: userID
    }, {
        $inc: { money: moneyToAdd }
    },
        { upsert: true })
}

module.exports.remBal = async (userID, moneyToRem) => {
    const user = await userSchema.updateOne({
        userId: userID
    }, {
        $inc: { money: -moneyToRem }
    })
}
