const TableTimeslot = require('../controllers/TableTimeslot.controller');
var router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");


router
    .route("/:restaurant_id/:timeslot_id") 
    .get(verifyToken, allowedTo(userRoles.customer), TableTimeslot.getTablesByRestaurantAndTimeslot);




module.exports =router;                