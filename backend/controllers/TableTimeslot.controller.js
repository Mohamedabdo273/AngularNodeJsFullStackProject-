const db = require("../models/db");
const mongoose = require('mongoose');
const Restaurant = db.restaurant;
const Timeslot = db.timeslot;
const Table_Timeslot = db.TableTimeslot;
const Table = db.table;
const appError = require("../utils/appError");
const asyncWrapper = require("../middlewares/asyncWrapper");
const successResponse = require("../utils/successResponse");


/////////////////////////////////////////////////////////////////////////////////////////////
exports.getTablesByRestaurantAndTimeslot = asyncWrapper(async (req, res, next) => {
    const restaurantId = req.params.restaurant_id;
    const timeslotId = req.params.timeslot_id;
    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(timeslotId)) {
        return next(appError.create("Invalid restaurant or timeslot ID", 400));
    }
    const tables = await Table_Timeslot.find({
        timeslot: new mongoose.Types.ObjectId(timeslotId),
    })
        .populate({
            path: "table",
            match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) },
            select: "tableNumber capacity",
        })
        .lean();
    const filteredTables = tables.filter((entry) => entry.table);
    if (!filteredTables.length) {
        // return res.status(404).json({massage:"No tables found for the specified restaurant and timeslot"});
        return next(appError.create("No tables found for the specified restaurant and timeslot",404)); 
    }
    return res.status(200).json({
        tables: filteredTables.map(entry => ({
            tableTimeslotId: entry._id,
            tableId: entry.table._id,
            tableNumber: entry.table.tableNumber,
            capacity: entry.table.capacity,
            isAvailable: entry.isAvailable,
        }))
    });
});


