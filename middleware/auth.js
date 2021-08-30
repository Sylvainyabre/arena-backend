const AccessControl = require('accesscontrol')
const User = require('../models/User')

function checkPermission(role){
    console.log("Permission middleware ran !")
    return async(req,res,next) =>{
        if(req.user.role !== role){
            return res.status(401).json({message:`Action only allowed for ${role} users.`})
        }else{
            return next()
        }
    }
}

module.exports = checkPermission;