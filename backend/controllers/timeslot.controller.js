const db = require("../models/db");
const Restaurant = db.restaurant;
const Timeslot = db.timeslot;
const Table_Timeslot = db.TableTimeslot;
const Table = db.table;
const appError = require("../utils/appError");
const asyncWrapper = require("../middlewares/asyncWrapper");
const successResponse = require("../utils/successResponse");

exports.getTimeslots = asyncWrapper(async (req, res, next) => {
    const restaurantId = req.params.id;
    const timeslots = await Timeslot.findOne({ restaurantId: restaurantId });

    if (!timeslots) {
        return next(appError.create("Couldn't find", 404));
    }
    return res.status(200).json({
        timeslots: timeslots.timeslots
    });
});

const mongoose = require('mongoose');

exports.addTimeslot = asyncWrapper(async (req, res, next) => {
    const { time1, time2, time3, time4, time5 } = req.body;
    let { id: restaurantId } = req.params;

    // Sanitize and validate restaurantId
    restaurantId = restaurantId.trim();
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return next(appError.create("Invalid restaurant ID format", 400));
    }

    // Validate all five timeslots are provided
    if (!time1 || !time2 || !time3 || !time4 || !time5) {
        return next(appError.create("Please provide exactly 5 timeslot values", 400));
    }

    // Validate restaurant existence
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(appError.create("Restaurant not found", 404));
    }

    // Check for existing valid timeslots
    const existingTimeslot = await Timeslot.findOne({ restaurantId });
    if (existingTimeslot) {
        return next(appError.create("Timeslots already exist and are still valid for this restaurant", 400));
    }

    // Fetch restaurant tables
    const tables = await Table.find({ restaurantId });
    if (!tables.length) {
        return next(appError.create("No tables found for this restaurant", 404));
    }

    // Create and save new timeslots
    const currentTimestamp = new Date();
    const timeslotData = new Timeslot({
        timeslots: [
            { time: time1 },
            { time: time2 },
            { time: time3 },
            { time: time4 },
            { time: time5 },
        ],
        restaurantId,
        createdAt: currentTimestamp,
    });
    const savedTimeslot = await timeslotData.save();

    // Associate timeslots with tables
    const tableTimeslotData = [];
    for (const table of tables) {
        const timeslotEntries = savedTimeslot.timeslots.map((slot) => ({
            table: table._id,
            timeslot: slot._id,
            isAvailable: true,
            createdAt: currentTimestamp,
        }));
        tableTimeslotData.push(...timeslotEntries);
    }
    await Table_Timeslot.insertMany(tableTimeslotData);

    return res.status(201).json({massage:"Timeslots and table-timeslot associations added successfully",
        timeslots: savedTimeslot,
        tableTimeslotAssociations: tableTimeslotData,
    });
});
exports.getTimeslotsByResID = asyncWrapper(async (req, res, next) => {
    const restaurantId = req.params.id;

    // Find all timeslots matching the restaurantId
    const timeslots = await Timeslot.find({ restaurantId });

    // If no timeslots are found, return a 404 error
    if (!timeslots || timeslots.length === 0) {
        return next(appError.create("No timeslots for this restaurant", 404));
    }

    // Return the array of timeslots
    return res.status(200).json(timeslots);
});
