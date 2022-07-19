'use strict'

const User = require('../models/user.model');
const jwt = require('../services/jwt')
const { validateData, encrypt, checkPassword, checkUpdate, checkPermission, checkUpdateRole } = require('../utils/validate');

exports.register = async(req,res)=>{
    try{
        let params = req.body;
        let data ={
            username: params.username,
            password: params.password,
            name: params.name,
            phone: params.phone,
            email: params.email,
            role: 'CLIENT'
        };

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        let userExist = await User.findOne({username: params.username});
        if(userExist) return res.status(400).send({message: `Username ${params.username} already exist`});
        data.surname = params.surname;
        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        return res.send({message: 'User created successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'failed to save user'}) ;
    }
}

exports.login = async(req,res)=>{
    try{
        let params = req.body;
        let data = {
            username: params.username,
            password: params.password
        };
        
        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        let userExist = await User.findOne({username: params.username}).lean();
        if(userExist && await checkPassword(params.password, userExist.password)){
            let token = await jwt.createToken(userExist)
            delete userExist.password;
            return res.send({token, userExist, message: 'Login successfully'});
        }else return res.status(401).send({message: 'Invalid credentials'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to login'})
    }
}

exports.update = async(req, res)=>{
    try{
        let userId = req.params.id;
        let params = req.body;

        let userExist = await User.findOne({_id: userId});
        if(!userExist) return res.send({message: 'User not found'});
        let validateUpdate = await checkUpdate(params);
        if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});
        let permission = await checkPermission(userId, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'You dont have permission to update this user'});
        let usernameExist = await User.findOne({username: params.username});
        if(usernameExist) return res.send({message: `Username ${params.username} already in use`});
        let userUpdate = await User.findOneAndUpdate({_id: userId}, params, {new: true}).lean();
        return res.send({userUpdate, message: 'User updated'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update user'});
    }
}

//FUNCIONES PARA ADMIN

exports.getClients = async(req,res)=>{
    try{
        let users = await User.find().lean();
        return res.send(users);
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error getting users'});
    }
}

exports.getClient = async(req,res)=>{
    try{
        let userId = req.params.id
        let user = await User.findOne({_id: userId}).lean();
        if(!user) return res.status(400).send({message: 'User not found'})
        return res.send(user);
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error getting users'});
    }
}


exports.createAdmin = async(req, res)=>{
    try{
        let params = req.body;
        let data = {
            username: params.username,
            password: params.password,
            name: params.name,
            phone: params.phone,
            email: params.email,
            role: 'ADMIN'
        };

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        let userExist = await User.findOne({username: params.username});
        if(userExist) return res.send({message: `Username ${params.username} already exist`});
        data.surname = params.surname;
        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        return res.send({message: 'Admin created successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving admin'});
    }
}

exports.updateClient = async(req, res)=>{
    try{
        let userId = req.params.id;
        let params = req.body;

        let userExist = await User.findOne({_id: userId});
        if(!userExist) return res.status(400).send({message: 'User not found'});
        let emptyParams = await checkUpdateRole(params);
        if(emptyParams === false) return res.send({message: 'Empty params or params not update'});
        if(userExist.role === 'ADMIN') return res.send({message: 'Can not update an admin'});
        let usernameExist = await User.findOne({username: params.username});
        if(usernameExist) return res.send({message: `Username ${params.username} already taken`});
        if(params.role != 'ADMIN' && params.role != 'CLIENT') return res.status(400).send({message: 'Invalid role'});
        let userUpdated = await User.findOneAndUpdate({_id: userId}, params, {new: true}).lean();
        return res.send({userUpdated, message: 'User updated successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error updating user'});
    }
}

exports.deleteClient = async(req, res)=>{
    try{
        let userId = req.params.id;
        
        let userExist = await User.findOne({_id: userId});
        if(!userExist) return res.send({message: 'User not found'});
        if(userExist.role === 'ADMIN') return res.send({message: 'Could not delete user with admin role'});
        let userDeleted = await User.findOneAndDelete({_id: userId}).lean();
        return res.send({message: 'Account deleted', username: userDeleted.username})
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error removing account'});
    }
}