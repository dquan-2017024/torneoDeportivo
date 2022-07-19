'use strict'

const mongoose = require('mongoose');

const leagueModel = mongoose.Schema ({
    name: String,
    user: {type: mongoose.Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('League', leagueModel);