const db = require("../models/db");
const mongoose = require("mongoose");
const Restaurant = db.restaurant;
const Timeslot = db.timeslot;
const Table_Timeslot = db.TableTimeslot;
const Table = db.table;
const user = db.user;
const dboffer = db.offer;
const reservation = db.reservation;
const AppError = require("../utils/appError");
const asyncWrapper = require('../middlewares/asyncWrapper');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./app/config/.env" });

/////////////////////////////////////////////////////////////////////////////////////////////

exports.getallOffer = asyncWrapper(async (req, res, next) => {
    const offers = await dboffer.find({});
    if (!offers.length) {
        return next(AppError.create("No restaurants found", 404));
    }
    const total = await dboffer.countDocuments({});
    return res.status(200).json(offers);
});
exports.getvendorsresturantOffers = asyncWrapper(async (req, res, next) => {
    const resturantid=req.params.id;
    const data = await dboffer.find({restaurantId: resturantid });
    if (data.length > 0) {
        return res.status(200).json(data);
    } else {
        return next(AppError.create("No Offers found", 404));
    }
});
exports.makeOffer = asyncWrapper(async (req, res, next) => {
    const { offer } = req.body;
    const restaurantid = req.params.id;

    // Debug log
    console.log("restaurantid:", restaurantid);

    // Find restaurant by ID
    const restaurant = await Restaurant.findById(restaurantid);

    // Handle null case
    if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
    }

    // Get restaurant name
    const restaurantName = restaurant.name;
    console.log(typeof offer);
    // Create a new offer instance
    const newOffer = new dboffer({
        offer, 
        restaurantId: restaurantid, // Note: Ensure the field name matches your model
        restaurantName
    });

    // Save the new offer
    const data = await newOffer.save();
    res.status(201).json({ message: "Offer created successfully", data });
});
exports.deleteOffer = asyncWrapper(async (req, res, next) => {
    const offerId = req.params.id;

    // Find offer by ID
    const offer = await dboffer.findById(offerId);
    if (!offer) {
        return next(AppError.create("not match",404));
    }
    await dboffer.deleteOne({ _id: offerId });
    res.status(200).json({ message: "Offer deleted successfully" });
});
exports.getOfferById = asyncWrapper(async (req, res, next) => {
    const offerId = req.params.id;
    const offer = await dboffer.findById(offerId);
    if (!offer) {
        return next(AppError.create("not match",404));
    }
    res.status(200).json({ offer });

});