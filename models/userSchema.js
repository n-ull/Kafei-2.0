const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const userSchema = new mongoose.Schema({
    userId: reqString,
    clans: [String],
    money: {
        type: Number,
        default: 0,
        min: 0
    },
    medals: [String]
})

module.exports = mongoose.model('users', userSchema);