require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');
const db = require("../models/db");
const Restaurant = db.restaurant;
const Table = db.table;
const asyncWrapper = require('../middlewares/asyncWrapper');
const appError = require('../utils/appError');
const Timeslot = db.timeslot;
const Table_Timeslot = db.TableTimeslot;
const { client } = require('../models/redisClient');
const User = db.user;
exports.viewAllRestaurants = asyncWrapper(async (req, res, next) => {
    // Fetch restaurants with pagination
    const restaurants = await Restaurant.find({});

    // Check if restaurants exist
    if (!restaurants || restaurants.length === 0) {
        return next(appError.create("No restaurants found", 404));
    }

    // Fetch vendor names for each restaurant
    const restaurantData = await Promise.all(
        restaurants.map(async restaurant => {
            const vendor = await User.findById(restaurant.vendor_id); // Fetch the vendor by ID
            return {
                ...restaurant._doc, // Include all restaurant fields
                vendorName: vendor ? vendor.Name : "Unknown Vendor" // Add vendor name or default if not found
            };
        })
    );

    // Get the total count for all restaurants (for pagination info)
    const total = await Restaurant.countDocuments({});

    // Send paginated response
    res.status(200).json({
        success: true,
        data: restaurantData,
    });
});


exports.deleteresturant = asyncWrapper(async (req, res, next) => {
    const restaurantId  = req.params.id;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(appError.create("Restaurant not found", 404));
    }
    const tables = await Table.find({ restaurantId: restaurantId });
    const tableIds = tables.map((table) => table._id);
    await Table_Timeslot.deleteMany({ table: { $in: tableIds } });
    await Timeslot.deleteOne({ restaurantId });
    await Table.deleteMany({ restaurantId: restaurantId });
    await reservation.deleteMany({restaurantId: restaurantId });
    await dboffer.deleteMany({restaurantId: restaurantId});
    await restaurant.deleteOne();
    res.status(200).json({
        message: "Restaurant and all associated resources deleted successfully",
    });
});


exports.searchRestaurantByName = asyncWrapper(async (req,res,next)=>{
    const name = req.query.name;
    const restaurants = await Restaurant.find({name:{$regex:name,$options:'i'}});
    if(!restaurants){
        return next(new appError("not match",404));
    }
    res.status(200).json({data:restaurants});
});

exports.searchRestaurantByLocation = asyncWrapper(async(req,res,next)=>{
    const location = req.query.location;
    const restaurants = await Restaurant.find({location:{$regex:location,$options:'i'}});
    if(!restaurants){
        return next(new appError("not match",404));
    }
    res.status(200).json({data:restaurants});
});

exports.searchRestaurantByCategory = asyncWrapper(async(req,res,next)=>{
    const category = req.query.foodCategory;
    const restaurants = await Restaurant.find({foodCategory:{$regex:category,$options:'i'}});
    if(!restaurants){
        return next(new appError("not match",404));
    }
    res.status(200).json({data:restaurants});
});

exports.addRestaurant = asyncWrapper(async (req, res, next) => {
    const {
        name,
        location,
        foodCategory,
        description,
        numberOfTables = 10,
        longitude,
        latitude,
        rating
    } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(appError.create('No token provided', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SCREET);
    const vendorId = decoded.id;

    // Check if a restaurant with the same longitude and latitude exists
    const existingRestaurant = await Restaurant.findOne({ longitude, latitude });
    if (existingRestaurant) {
        return next(appError.create("A restaurant with the same longitude and latitude already exists", 400));
    }

    const newRestaurant = new Restaurant({
        name,
        location,
        foodCategory,
        description,
        numberOfTables,
        image: req.file?.filename,
        longitude,
        latitude,
        rating,
        vendor_id: vendorId,
    });

    // Save the new restaurant to MongoDB
    const savedRestaurant = await newRestaurant.save();

    // Create tables for the restaurant
    const tables = [];
    for (let i = 0; i < numberOfTables; i++) {
        const currentTableCount = await Table.countDocuments({ restaurantId: savedRestaurant._id });
        if (currentTableCount >= savedRestaurant.numberOfTables) {
            break;
        }
        const table = new Table({
            tableNumber: i + 1,
            capacity: 6,
            restaurantId: savedRestaurant._id,
        });
        const savedTable = await table.save();
        tables.push(savedTable);
    }

    // After adding the restaurant to MongoDB, update the Redis cache
    const cacheKey = `vendor:${vendorId}:restaurants`;

    // Check if the cache exists for this vendor
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
        // If data exists in cache, add the new restaurant to the cached data
        const { data } = JSON.parse(cachedData);
        data.push(savedRestaurant);

        // Update the cache with the new restaurant data
        await client.setEx(cacheKey, 3600, JSON.stringify({ data }));
    } else {
        // If no data in cache, create a new cache entry with the restaurant data
        await client.setEx(cacheKey, 3600, JSON.stringify({ data: [savedRestaurant] }));
    }

    return res.status(201).json({
        message: "Restaurant and tables created successfully",
        savedRestaurant,
        tables
    });
});



exports.updateRestaurant = asyncWrapper(async (req, res, next) => {
    const id = req.params.id;
    const { name, location, foodCategory, description, image, longitude, latitude, numberOfTables, rating } = req.body;
    const existingRestaurant = await Restaurant.findOne({ 
        longitude, 
        latitude, 
        _id: { $ne: id }
    });
    if (existingRestaurant) {
        return next(appError.create("A restaurant with the same longitude and latitude already exists", 400));
    }
    const updatedData = {
        name,
        description,
        image: req.file ? req.file.filename : image,
        location,
        longitude,
        latitude,
        foodCategory,
        numberOfTables,
        rating
    };
    const data = await Restaurant.findByIdAndUpdate(id, updatedData, { new: true });
    if (data) {
        return res.status(200).json({ message: "Restaurant updated successfully", data });
    } else {
        return next(appError.create("Restaurant not found", 404));
    }
});

// Make sure the Redis client supports promises (version 4.x or later)
exports.viewVendorRestaurants = asyncWrapper(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(appError.create('No token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SCREET);
    const id = decoded.id;

    // Key for caching in Redis (using vendor id without pagination)
    const cacheKey = `vendor:${id}:restaurants`;

    try {
        // Check if the data is in Redis cache
        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            // If the data is cached, return it from Redis
            console.log('Retrieved from Redis Cache'); // This log indicates that the response is from Redis
            const { data } = JSON.parse(cachedData);
            return res.status(200).json({ data, source: 'Redis' }); // Include 'source: Redis' in the response to indicate Redis
        }

        // If not in cache, fetch data from MongoDB
        const restaurants = await Restaurant.find({ vendor_id: id });

        if (!restaurants || restaurants.length === 0) {
            return next(appError.create('No restaurants found', 404));
        }

        // Prepare the response
        const response = {
            data: restaurants
        };

        // Cache the response in Redis with an expiration time of 1 hour (3600 seconds)
        await client.setEx(cacheKey, 3600, JSON.stringify(response));

        // Return the response
        console.log('Retrieved from MongoDB'); // This log indicates that the response is from MongoDB
        res.status(200).json({ data: restaurants, source: 'MongoDB' }); // Include 'source: MongoDB' in the response to indicate MongoDB
    } catch (err) {
        return next(appError.create('Error with Redis or MongoDB', 500));
    }
});









exports.getRestaurantByID = asyncWrapper(async(req,res,next)=>{
    const id = req.params.id;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        return next(appError.create('Restaurant not found', 404));
    }
    res.status(200).json({ data: restaurant });
})
