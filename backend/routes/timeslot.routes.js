const timeslot = require('../controllers/timeslot.controller');
var router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");


router.route("/:id")
    .get(verifyToken, allowedTo(userRoles.customer),timeslot.getTimeslots);
    router.route("getId/:id")
    .get(verifyToken,allowedTo(userRoles.customer),timeslot.getTimeslotsByResID);
router.route("/add/:id")
    .post(verifyToken, allowedTo(userRoles.vendor),timeslot.addTimeslot);
module.exports =router;                