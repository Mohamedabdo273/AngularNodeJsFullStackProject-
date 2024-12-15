const appError = require("../utils/appError")
const httpStatusText = require('../utils/httpStatusText');
module.exports = (...roles) => {
    return(req,res,next)=>{
        console.log("Current User Role:", req.currentUser?.role);
        if(!roles.includes(req.currentUser.role)){
            err = appError.create("You do not have permission to perform this action",403,httpStatusText.FAIL)
            return next(err);
        }
        next();
    }
}