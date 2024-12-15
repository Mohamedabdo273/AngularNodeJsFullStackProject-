const reservation = require('../controllers/reservation.controller');
var router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");


router.route("/make/:table_timeslotid/:restaurant_id")
    .post(verifyToken, allowedTo(userRoles.customer),reservation.makeReservation);
router.route("/viewReservations")
    .get(verifyToken, allowedTo(userRoles.vendor,userRoles.customer,userRoles.admin),reservation.getallreservations);
    router.route("/confirm/:id")
    .post(verifyToken,allowedTo(userRoles.vendor),reservation.confirmReservation);
router.route("/cancel/:id")
    .post(verifyToken,allowedTo(userRoles.vendor),reservation.cancelreservation);
router.route("/bill/:id")
.post(verifyToken,allowedTo(userRoles.vendor),reservation.sendbill);
module.exports =router;
