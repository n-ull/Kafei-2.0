const userSchema = require('../models/userSchema');

module.exports.checkBal = async (userID) => {
    const user = await userSchema.findOneAndUpdate(
        {
            userId: userID
        },
        {
            $setOnInsert: {
                userId: userID,
                money: 0,
                bank: 0
            }
        },
        {
            upsert: true
        })

    let balance = !user ? 0 : {wallet: user.money, bank: user.bank};
    return balance
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

module.exports.deposit = async (userID, moneyToDep) => {
    const user = await userSchema.updateOne({
        userId: userID
    }, {
        $inc: {
            money: -moneyToDep,
            bank: moneyToDep
        }
    })
}

module.exports.withdraw = async (userID, moneyToWit) => {
    const user = await userSchema.updateOne({
        userId: userID
    }, {
        $inc: {
            money: moneyToWit,
            bank: -moneyToWit
        }
    })
}