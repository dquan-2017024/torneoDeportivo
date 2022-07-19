'use strict'

const bcrypt = require('bcrypt-nodejs');
const Matchday = require('../models/matchday.model');

exports.validateData = (data)=>{
    let keys = Object.keys(data), msg= '';

    for(let key of keys){
        if(data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `The param ${key} is required\n`
    }return msg.trim();
}

exports.encrypt =(password)=>{
    try{
        return bcrypt.hashSync(password);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPermission = async (id, sub)=>{
    try{
        if(id != sub){
            return false;
        }else{
            return true;
        }
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPassword = (password, hash)=>{
    try{
        return bcrypt.compareSync(password, hash)
    }catch(err){
        console.log(err);
        return err;
    }
}
exports.checkUpdate = async (params)=>{
    if(params.password || 
       Object.entries(params).length === 0 || 
       params.role ||
       params.user
       ){
        return false;
    }else{
        return true;
    }
}

exports.checkUpdateRole = async (params)=>{
    if(params.password || 
       Object.entries(params).length === 0 ||
       params.user
       ){
        return false;
    }else{
        return true;
    }
}


