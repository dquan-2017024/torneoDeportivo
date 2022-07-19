'use strict'

const League = require('../models/league.model');
const Matchday = require('../models/matchday.model');
const Team = require('../models/team.model');
const { validateData, checkPermission, checkUpdate, searchLocalGoals } = require('../utils/validate');

exports.createTeam = async(req, res)=>{
    try{
        let params = req.body;
        let data = {
            name: params.name,
            points: 0,
            goalsScored: 0,
            goalsAgainst: 0,
            goalsDifference: 0,
            matchesPlayed: 0,
            league: params.league,
            user: req.user.sub
        }
         
        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        let leagueExist = await League.findOne({_id: params.league});
        if(!leagueExist) return res.send({message: 'League not found'});
        let teams = await Team.find({league: params.league});
        if(teams.length == 10) return res.send({message: 'Cannot add more than 10 teams in a league'});
        let permission = await checkPermission(leagueExist.user, data.user);
        if(permission == false) return res.status(401).send({message: 'You dont have permission to create teams in this league'});
        let nameExist = await Team.findOne({
            $and:[
                {user: data.user},
                {name: data.name}
                
            ]
        });
        if(nameExist)  return res.status(400).send({message: `Team ${data.name} already exist in this league`});

        let team = new Team(data);
        await team.save();
        return res.send({message: 'Team created successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error creating team'});
    }
};

exports.updateTeam = async(req, res)=>{
    try{
        let teamId = req.params.id;
        let params = req.body;

        let teamExist = await Team.findOne({_id: teamId}).lean();
        if(!teamExist) return res.send({message: 'Team not found'});
        let emptyParams = await checkUpdate(params);
        if(emptyParams == false) return res.status(400).send({message: 'Cannot update this information or empty params'});
        let permission = await checkPermission(teamExist.user, req.user.sub);
        if(permission == false) return res.status(401).send({message: 'You dont have permission to update this team'});
        
        if(!params.league){
            let nameExist = await Team.findOne({
                $and:[
                    {user: req.user.sub},
                    {name: params.name}
                ]
            });
            if(nameExist && teamExist.name != params.name) return res.status(400).send({message: `Team ${params.name} already exist in this league`});
            let teamUpdated = await Team.findOneAndUpdate({_id: teamId}, params, {new:true});
            return res.send({teamUpdated, message: 'Team updated'});
        }else{
            let leagueExist = await League.findOne({_id: params.league});
            if(!leagueExist) return res.send({message: 'League not found'});
            let permission = await checkPermission(leagueExist.user, req.user.sub);
            if(permission == false) return res.status(401).send({message: 'You dont have permission to change a team to this league'});
            let nameExist = await Team.findOne({
                $and:[
                    {user: req.user.sub},
                    {name: params.name},
                    {league: params.league}
                ]
            });
            if(nameExist && teamExist.name != params.name) return res.status(400).send({message: `Team ${params.name} already exist in this league`});
            let teamUpdated = await Team.findOneAndUpdate({_id: teamId}, params, {new:true});
            return res.send({teamUpdated, message: 'Team updated'});
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error updating teams'});
    }
}

exports.deleteTeam = async(req, res)=>{
    try{
        let teamId = req.params.id;

        let teamExist = await Team.findOne({_id: teamId});
        if(!teamExist) return res.send({message: 'Team not found'});
        let permission = await checkPermission(teamExist.user,req.user.sub);
        if(permission == false) return res.status(401).send({message: 'You dont have permission to delete this team'});
        let teamDeleted = await Team.findOneAndDelete({_id: teamId});
        return res.send({message: 'Team deleted', team: teamDeleted.name});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error removing team'});
    }
}

exports.getTeam = async(req,res)=>{
    let teamId = req.params.id

    let team = await Team.findOne({_id: teamId}).lean();
    if(!team) return res.status(400).send({message: 'Team not found'});
    return res.send(team);
}

exports.getTeams = async(req, res)=>{
    try{
        let leagueId = req.params.id; 

        let leagueExist = await League.findOne({_id: leagueId});
        if(!leagueExist) return res.send({message: 'League not found'});
        let permission = await checkPermission(leagueExist.user, req.user.sub);
        if(permission == false) return res.status(401).send({message: 'You dont have permission to view this league'});
        let teams = await Team.find({league: leagueId});
        teams.sort((a , b)=>{
            
            if(a.points > b.points){
                return -1;
            }else if(a.points < b.points){
                return 1;
            }else if (a.points == b.points){
                if(a.goalsDifference > b.goalsDifference){
                    return -1;
                }else if(a.goalsDifference < b.goalsDifference){
                    return 1;
                }else if(a.goalsDifference == b.goalsDifference){
                    if(a.goalsScored > b.goalsScored){
                        return -1;
                    }else if(a.goalsScored < b.goalsScored){
                        return 1;
                    }else if(a.goalsScored == b.goalsScored){
                        if(a.goalsAgainst > b.goalsAgainst){
                            return 1;
                        }else if(a.goalsAgainst < b.goalsAgainst){
                            return -1;
                        }else{
                            return 0;
                        } 
                    }
                    
                } 
                
            }
        });
        let names = teams.map(teams=>teams.name);
        let points = teams.map(teams=>teams.points);
        return res.status(200).send({teams,names,points});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error getting teams'});
    }
}
