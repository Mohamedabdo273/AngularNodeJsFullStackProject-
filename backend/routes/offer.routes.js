

    var router = require("express").Router();
    const offer = require("../controllers/offer.controller.js");
    const verifyToken = require("../middlewares/verifyToken");
    const allowedTo = require("../middlewares/allowedTo");
    const userRoles = require("../utils/userRoles");
    /////////////////////////////////////////////////////////////////////////////////////////////
    router.route("/getalloffers")
    .get(verifyToken, allowedTo(userRoles.customer),offer.getallOffer);
    router.route("/makeoffer/:id")
    .post(verifyToken, allowedTo(userRoles.vendor),offer.makeOffer);
    router.route("/deleteoffer/:id")
    .delete(verifyToken, allowedTo(userRoles.vendor),offer.deleteOffer);
    router.route("/getoffer/:id")
    .get(verifyToken, allowedTo(userRoles.customer),offer.getOfferById);
    router.route("/getvendorsrestaurantoffers/:id")
    .get(verifyToken,allowedTo(userRoles.vendor),offer.getvendorsresturantOffers);
    /////////////////////////////////////////////////////////////////////////////////////////////
    module.exports =router;                