const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const userSchema = new mongoose.Schema({
    userId: reqString,
    money: {
        type: Number,
        default: 0,
        min: 0,
        required: true
    },
    medals: [String]
})

module.exports = mongoose.model('users', userSchema);