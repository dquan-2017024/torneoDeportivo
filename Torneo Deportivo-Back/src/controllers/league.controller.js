'use strict'

const League = require('../models/league.model');
const User = require('../models/user.model');
const { validateData, repeatName, checkPermission, checkUpdate } = require('../utils/validate');

exports.createLeague = async(req,res)=>{
    try{
        let params = req.body;
        let data = {
            user: req.user.sub,
            name: params.name
        }

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        let nameExist = await League.findOne({ 
            $and: [
                {user: data.user},
                {name: data.name}
            ]
        });
        if(nameExist) return res.status(400).send({message: `League ${data.name} already exist`});

        let league = new League(data);
        await league.save();
        return res.send({message: 'League created successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error creating league'})
    }
};

exports.getLeagues = async(req,res)=>{
    try{
        let leagues = await League.find({user: req.user.sub}).lean();
        return res.send(leagues);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error getting leagues'});
    }
};

exports.getLeague = async(req,res)=>{
    let leagueId = req.params.id

    let league = await League.findOne({_id: leagueId}).lean();
    if(!league) return res.status(400).send({message: 'Team not found'});
    return res.send(league);
}

exports.updateLeague = async(req,res)=>{
    try{
        let leagueId = req.params.id;
        let params = req.body;

        let leagueExist = await League.findOne({_id: leagueId});
        if(!leagueExist) return res.send({message: 'League not found'});
        let emptyParams = await  checkUpdate(params);
        if(emptyParams == false)  return res.status(400).send({message: 'Cannot update this information or empty params'});
        let permission = await checkPermission(leagueExist.user, req.user.sub);
        if(permission == false) return res.status(401).send({message: 'You dont have permission to update this league'});
        let nameExist = await League.findOne({ $and: [
            {user: req.user.sub},
            {name: params.name}
        ]});
        if(nameExist) return res.status(400).send({message: `League ${params.name} already exist`});
        let leagueUpdated = await League.findOneAndUpdate({_id: leagueId}, params, {new: true}).lean();
        return res.send({leagueUpdated, message: 'League updated'});
    }catch(err){     
        console.log(err);
        return res.status(500).send({err, message: 'Error updating league'});
    }
};

exports.deleteLeague = async(req,res)=>{
    try{
        let leagueId = req.params.id;
        
        let leagueExist = await League.findOne({_id: leagueId});
        if(!leagueExist) return res.send({message: 'League not found'});
        let permission = await checkPermission(leagueExist.user, req.user.sub);
        if(permission == false) return res.status(401).send({message: 'You dont have permission to delete this league'});
        let leagueDeleted = await League.findOneAndDelete({_id: leagueId}).lean();
        return res.send({message: 'League deleted', league: leagueDeleted.name});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error removing league'});
    }
}

//FUNCIONES PARA ADMIN


exports.saveLeague = async(req,res)=>{
    try{
        let params = req.body;
        let data = {
            user: params.user,
            name: params.name
        }

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        let userExist = await User.findOne({username: data.user});
        if(!userExist)return res.send({message: 'User not found '});
        if(req.user.sub != userExist._id  && userExist.role === 'ADMIN') return res.send({message: 'Cannot create teams for another user that his role is ADMIN'})
        let nameExist = await League.findOne({
            $and: [
                {user: userExist._id},
                {name: data.name}
            ]
        });
        if(nameExist) return res.status(400).send({message: `League ${data.name} already exist`});
        data.user = userExist._id;
        let league = new League(data);
        await league.save();
        return res.send({message: 'League created successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error creating league'})
    }
};

exports.obtainLeagues = async(req,res)=>{
    try{
        let leagues = await League.find().populate('user').lean();
        return res.send(leagues);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error getting leagues'});
    }
};

exports.obtainLeague = async(req,res)=>{
    try{
        let leagueId = req.params.id;
        let league = await League.findOne({_id: leagueId}).lean();
        return res.send(league);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error getting leagues'});
    }
};

exports.editLeague = async(req,res)=>{
    try{
        let leagueId = req.params.id;
        let params = req.body;

        let leagueExist = await League.findOne({_id: leagueId}).populate('user').lean();
        if(!leagueExist) return res.send({message: 'League not found'});
        let emptyParams = await  checkUpdate(params);
        if(emptyParams == false)  return res.status(400).send({message: 'Cannot update this information or empty params'});
        let nameExist = await League.findOne({ $and: [
            {user: leagueExist.user},
            {name: params.name}
        ]});
        if(nameExist) return res.status(400).send({message: `League ${params.name} already exist`});
        if(leagueExist.user.username != req.user.username && leagueExist.user.role === 'ADMIN') return res.send({message: 'Cannot edit teams from another user that his role is ADMIN'})
        let leagueUpdated = await League.findOneAndUpdate({_id: leagueId}, params, {new: true}).lean();
        return res.send({leagueUpdated, message: 'League updated'});
    }catch(err){     
        console.log(err);
        return res.status(500).send({err, message: 'Error updating league'});
    }
};

exports.removeLeague = async(req,res)=>{
    try{
        let leagueId = req.params.id;
        
        let leagueExist = await League.findOne({_id: leagueId}).populate('user').lean();
        if(!leagueExist) return res.send({message: 'League not found'});
        if(leagueExist.user.username != req.user.username && leagueExist.user.role === 'ADMIN') return res.send({message: 'Cannot delete teams from another user that his role is ADMIN'})
        let leagueDeleted = await League.findOneAndDelete({_id: leagueId}).lean();
        return res.send({message: 'League deleted', league: leagueDeleted.name});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error removing league'});
    }
}