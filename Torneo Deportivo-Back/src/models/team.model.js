'use strict'

const mongoose = require('mongoose');

const teamModel = mongoose.Schema ({
    name: String,
    points: Number,
    goalsScored: Number,
    goalsAgainst: Number,
    goalsDifference: Number,
    matchesPlayed: Number,
    league: {type: mongoose.Schema.ObjectId, ref:'League'},
    user: {type: mongoose.Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Team', teamModel);