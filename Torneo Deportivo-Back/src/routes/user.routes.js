'use strict'

const express = require('express');
const api = express.Router();
const userController = require('../controllers/user.controller');
const mdAuth = require('../services/authenticated');

api.post('/register', userController.register);
api.post('/login', userController.login);
api.put('/update/:id', mdAuth.ensureAuth, userController.update);

//RUTAS PARA ADMIN

api.get('/getClients', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getClients);
api.get('/getClient/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.getClient);
api.post('/createAdmin', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.createAdmin);
api.put('/updateClient/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.updateClient);
api.delete('/deleteClient/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.deleteClient);

module.exports = api;
