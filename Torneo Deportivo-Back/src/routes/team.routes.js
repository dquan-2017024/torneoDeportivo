'use strict'

const express = require('express');
const api = express.Router();
const teamController = require('../controllers/team.controller');
const mdAuth = require('../services/authenticated');

api.post('/createTeam', mdAuth.ensureAuth, teamController.createTeam);
api.get('/getTeam/:id',  mdAuth.ensureAuth, teamController.getTeam);
api.get('/getTeams/:id',  mdAuth.ensureAuth, teamController.getTeams);
api.put('/updateTeam/:id', mdAuth.ensureAuth, teamController.updateTeam);
api.delete('/deleteTeam/:id', mdAuth.ensureAuth, teamController.deleteTeam);

module.exports = api;