const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const clansSchema = new mongoose.Schema({
    guildId: reqString,
    clanName: {
        type: String,
        required: true,
        unique: true
    },
    roleId: reqString,
    ownerId: reqString,
    background: {
        type: String,
        default: 'linkdelbgdefault.jpg'
    },
    money: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model('clans', clansSchema);
