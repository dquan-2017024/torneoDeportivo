'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'IN6AM';

exports.ensureAuth = (req,res,next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'The request does not contain the authorization header'}); 
    }else{
        try{
            var token = req.headers.authorization.replace(/['"]+/g, '');
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'Expired token'});
            }
        }catch(err){
            return res.status(404).send({message: 'The token is not valid'});
        }
        req.user = payload;
        next();
    }
}

exports.isAdmin = async (req, res, next)=>{
    try{
        const user = req.user;
        if(user.role === 'ADMIN') return next();
        else return res.status(403).send({message: 'User unauthorized'});
    }catch(err){
        console.log(err);
        return err;
    }
}