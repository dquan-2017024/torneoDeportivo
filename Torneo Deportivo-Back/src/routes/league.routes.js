'use strict'

const express = require('express');
const api = express.Router();
const leagueController = require('../controllers/league.controller');
const mdAuth = require('../services/authenticated');

api.post('/createLeague', mdAuth.ensureAuth, leagueController.createLeague);
api.get('/getLeagues', mdAuth.ensureAuth, leagueController.getLeagues);
api.get('/getLeague/:id', mdAuth.ensureAuth, leagueController.getLeague);
api.put('/updateLeague/:id', mdAuth.ensureAuth, leagueController.updateLeague);
api.delete('/deleteLeague/:id', mdAuth.ensureAuth, leagueController.deleteLeague);

//RUTAS PARA ADMIN

api.post('/saveLeague', [mdAuth.ensureAuth, mdAuth.isAdmin], leagueController.saveLeague);
api.get('/obtainLeagues', [mdAuth.ensureAuth, mdAuth.isAdmin], leagueController.obtainLeagues);
api.get('/obtainLeague/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], leagueController.obtainLeague);
api.put('/editLeague/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], leagueController.editLeague);
api.delete('/removeLeague/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], leagueController.removeLeague)

module.exports = api;