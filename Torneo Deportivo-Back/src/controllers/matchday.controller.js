'use strict'

const League = require('../models/league.model');
const MatchDay = require('../models/matchday.model');
const Team = require('../models/team.model');
const { validateData, checkPermission } = require('../utils/validate');

exports.addResult = async(req, res)=>{
    try{
        let params = req.body;
        let data = {
            number: params.number,
            localTeam: params.localTeam,
            localGoals: Number(params.localGoals),
            visitorTeam: params.visitorTeam,
            visitorGoals: Number(params.visitorGoals),
            user: req.user.sub
        }

        let msg = await validateData(data);
        if(msg) return res.status(400).send(msg);
        let localExist = await Team.findOne({name: data.localTeam}).lean();
        if(!localExist)  return res.send({message: 'Team local not found'});
        let visitorExist = await Team.findOne({name: data.visitorTeam});
        if(!visitorExist)  return res.send({message: 'Team visitor not found'});
        let leagueExist = await League.findOne({_id: localExist.league})
        if(!leagueExist) return res.send({message: 'League not found'});
        if(data.localTeam === data.visitorTeam) return res.status(400).send({message: 'Please, enter different team'})
        if(localExist.user.toString() !==  visitorExist.user.toString()) return res.status(401).send({message: 'You dont have permission to add results in team or leagues that you dont create'});
        let permission = await checkPermission(localExist.user, data.user);
        if(permission == false) return res.status(401).send({message: 'You dont have permission to use this teams'});
        if(localExist.league.toString() !=  visitorExist.league.toString()) return res.send({message: 'The teams are not in the same league'});

        let teams = await Team.find({league: localExist.league});
        let result = teams.length - 1;
        if(result < data.number) return res.send({message: `Can only have ${result} matchdays in this league`});
        let numberMatchday = await MatchDay.findOne({$and:[
            {number: data.number},
            {league: localExist.league}
            ]});
        if(numberMatchday){}else{
            let matchDay = new MatchDay({number: data.number, league: localExist.league}); 
            await matchDay.save();
        }
            
        let searchMatchDay = await MatchDay.findOne({number: data.number, $or:[
            {"teams.localTeam": localExist._id},
            {"teams.localTeam": visitorExist._id},
            {"teams.visitorTeam": localExist._id},
            {"teams.visitorTeam": visitorExist._id}
        ]});
        if(searchMatchDay) return res.send({message: 'Some of the teams have already played in this matchday'});
            let pushMatchday = await MatchDay.findOneAndUpdate(
                {$and:[ {number: data.number},
                    {league: localExist.league}
                ]},
                {$push:
                    {teams:{localTeam: localExist._id, localGoals: data.localGoals, 
                            visitorTeam: visitorExist._id, visitorGoals: data.visitorGoals}},
                league: localExist.league},
                {new: true}
            )
        if(data.localGoals > data.visitorGoals){
            let local = {
                points: localExist.points + 3,
                goalsScored: localExist.goalsScored + data.localGoals,
                goalsAgainst: localExist.goalsAgainst + data.visitorGoals,
                }
            let localUpdated = await Team.findOneAndUpdate({_id: localExist._id}, local,{new:true});
            let gamesLocal = await MatchDay.find({$or:[
                {"teams.localTeam": localExist._id},
                {"teams.localTeam": visitorExist._id}
            ]});
            
            let differenceLocal = {
                goalsDifference: localUpdated.goalsScored - localUpdated.goalsAgainst,
                matchesPlayed: gamesLocal.length
            }
            await Team.findOneAndUpdate({_id: localExist._id}, differenceLocal);
            
            let visitor = {
                goalsScored: visitorExist.goalsScored + data.visitorGoals,
                goalsAgainst: visitorExist.goalsAgainst + data.localGoals,
            }
            let visitorUpdated = await Team.findOneAndUpdate({_id: visitorExist._id}, visitor, {new: true});
            let gamesVisitor = await MatchDay.find({$or:[
                {"teams.visitorTeam": localExist._id},
                {"teams.visitorTeam": visitorExist._id}
            ]});
            let differenceVisitor = {
                goalsDifference: visitorUpdated.goalsScored - visitorUpdated.goalsAgainst,
                matchesPlayed: gamesVisitor.length
            }
            await Team.findOneAndUpdate({_id: visitorExist._id}, differenceVisitor);
            return res.send({message: 'New result add to matchday', pushMatchday});
        };
        if(data.localGoals < data.visitorGoals){
            let visitor = {
                points: visitorExist.points + 3,
                goalsScored: visitorExist.goalsScored + data.visitorGoals,
                goalsAgainst: visitorExist.goalsAgainst + data.localGoals,
                }
            let visitorUpdated = await Team.findOneAndUpdate({_id: visitorExist._id}, visitor,{new:true});
            let gamesVisitor = await MatchDay.find({$or:[
                {"teams.visitorTeam": localExist._id},
                {"teams.visitorTeam": visitorExist._id}
            ]});
            
            let differenceVisitor = {
                goalsDifference: visitorUpdated.goalsScored - visitorUpdated.goalsAgainst,
                matchesPlayed: gamesVisitor.length
            }
            await Team.findOneAndUpdate({_id: visitorExist._id}, differenceVisitor);
            
            let local = {
                goalsScored: localExist.goalsScored + data.localGoals,
                goalsAgainst: localExist.goalsAgainst + data.visitorGoals,
            }
            let localUpdated = await Team.findOneAndUpdate({_id: localExist._id}, local, {new: true});
            let gamesLocal = await MatchDay.find({$or:[
                {"teams.localTeam": localExist._id},
                {"teams.localTeam": visitorExist._id}
            ]});
            let differenceLocal = {
                goalsDifference: localUpdated.goalsScored - localUpdated.goalsAgainst,
                matchesPlayed: gamesLocal.length
            }
            await Team.findOneAndUpdate({_id: localExist._id}, differenceLocal);
            return res.send({message: 'New result add to matchday', pushMatchday});
        };
        if(data.localGoals === data.visitorGoals){
            let visitor = {
                points: visitorExist.points + 1,
                goalsScored: visitorExist.goalsScored + data.visitorGoals,
                goalsAgainst: visitorExist.goalsAgainst + data.localGoals,
                }
            let visitorUpdated = await Team.findOneAndUpdate({_id: visitorExist._id}, visitor,{new:true});
            let gamesVisitor = await MatchDay.find({$or:[
                {"teams.visitorTeam": localExist._id},
                {"teams.visitorTeam": visitorExist._id}
            ]});
            
            let differenceVisitor = {
                goalsDifference: visitorUpdated.goalsScored - visitorUpdated.goalsAgainst,
                matchesPlayed: gamesVisitor.length
            }
            await Team.findOneAndUpdate({_id: visitorExist._id}, differenceVisitor);
            
            let local = {
                points: localExist.points + 1,
                goalsScored: localExist.goalsScored + data.localGoals,
                goalsAgainst: localExist.goalsAgainst + data.visitorGoals,
            }
            let localUpdated = await Team.findOneAndUpdate({_id: localExist._id}, local, {new: true});
            let gamesLocal = await MatchDay.find({$or:[
                {"teams.localTeam": localExist._id},
                {"teams.localTeam": visitorExist._id}
            ]});
            let differenceLocal = {
                goalsDifference: localUpdated.goalsScored - localUpdated.goalsAgainst,
                matchesPlayed: gamesLocal.length
            }
            await Team.findOneAndUpdate({_id: localExist._id}, differenceLocal);
            return res.send({message: 'New result add to matchday', pushMatchday});
        };
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error adding results'});
    }
}
