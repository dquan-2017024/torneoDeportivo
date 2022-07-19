'use strict'

const mongoose = require('mongoose');

const matchdayModel = mongoose.Schema({
    number: Number,
    teams: [
        {
            localTeam:{type: mongoose.Schema.ObjectId, ref:'Team'},
            localGoals: Number,
            visitorTeam:{type: mongoose.Schema.ObjectId, ref: 'Team'},
            visitorGoals: Number
        }
    
    ],
    league: {type: mongoose.Schema.ObjectId, ref:'League'},
    user: {type: mongoose.Schema.ObjectId, ref:'User'}
});

module.exports = mongoose.model('Matchday', matchdayModel);