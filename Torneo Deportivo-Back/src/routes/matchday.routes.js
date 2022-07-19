'use strict'

const express = require('express');
const api = express.Router();
const matchDayController = require('../controllers/matchday.controller');
const mdAuth = require('../services/authenticated');

api.post('/addResult',mdAuth.ensureAuth, matchDayController.addResult);

module.exports = api;