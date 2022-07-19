'use strict'

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    name: String,
    surname: String,
    phone: String,
    email: String,
    role: String
});

module.exports = mongoose.model('User', userSchema)