require('dotenv').config({ path: '../.env' });
const db = require("../models/db");
const Table = db.table;
const Restaurant = db.restaurant;
const Timeslot = db.timeslot;
const Table_Timeslot = db.TableTimeslot;
const asyncWrapper = require('../middlewares/asyncWrapper');
const appError = require('../utils/appError');
const successResponse = require('../utils/successResponse');

exports.addTable = asyncWrapper(async (req, res, next) => {
    const { name, capacity = 6, restaurant_id } = req.body;
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
        return next(appError.create("Restaurant not found", 404));
    }
    const existingTables = await Table.find({ restaurantId: restaurant_id }).select("tableNumber").lean();
    const existingTableNumbers = existingTables.map(table => table.tableNumber);
    let newTableNumber = 1;
    while (existingTableNumbers.includes(newTableNumber)) {
        newTableNumber++;
    }
    const table = new Table({
        name,
        capacity,
        restaurantId: restaurant_id,
        tableNumber: newTableNumber
    });
    const savedTable = await table.save();
    let timeslotData = await Timeslot.findOne({ restaurantId: restaurant_id });
    const tableTimeslotData = timeslotData.timeslots.map(slot => ({
        table: savedTable._id,
        timeslot: slot._id,
        isAvailable: true,
        createdAt : new Date(),
    }));
    await Table_Timeslot.insertMany(tableTimeslotData);
    return res.status(201).json({message:"Table and timeslot associations added successfully",
        table: savedTable,
        timeslots: timeslotData.timeslots
    });
});

exports.deleteTable = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const table = await Table.findById(id);
    if (!table) {
        return next(appError.create("Table not found", 404));
    }
    await Table_Timeslot.deleteMany({ table: id });
    const deletedTable = await Table.findByIdAndDelete(id);
    return res.status(200).json({message:"Table and its associations deleted successfully", deletedTable});
});