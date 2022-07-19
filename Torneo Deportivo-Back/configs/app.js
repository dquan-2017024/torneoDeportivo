'use strict'

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('../src/routes/user.routes');
const leagueRoutes = require('../src/routes/league.routes');
const teamRoutes = require('../src/routes/team.routes');
const matchDayRoutes = require('../src/routes/matchday.routes')

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use('/user', userRoutes);
app.use('/league', leagueRoutes);
app.use('/team', teamRoutes);
app.use('/matchDay', matchDayRoutes);

module.exports = app;