require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');
const db = require("../models/db");
const Restaurant = db.restaurant;
const Timeslot = db.timeslot;
const Table_Timeslot = db.TableTimeslot;
const Table = db.table;
const User = db.user;
const dboffer = db.offer;
const reservation = db.reservation; 
const bcrypt = require('bcryptjs');
const asyncWrapper = require('../middlewares/asyncWrapper');
const appError = require('../utils/appError');
const generateJWT = require('../utils/generateJWT');
const userRoles = require('../utils/userRoles');
const httpStatusText = require('../utils/httpStatusText');
const successResponse = require('../utils/successResponse');
const { client } = require('../models/redisClient');
// Register a new user
exports.register = asyncWrapper(async (req, res, next) => {
    const { Name, phoneNumber, email, password} = req.body;
    const existingUser  = await User.findOne({ email });
    if (existingUser) {
        const error = appError.create("User  already exists", 400);
        return next(error);
    }

    // Create a new user
    const user = new User({
        Name,
        email,
        phoneNumber,
        password: await bcrypt.hash(password, 10),
        role: userRoles.customer, // Hash the password
    });
    const token = await generateJWT({ email: user.email,id: user._id, role: user.role });
    user.token = token;
    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User  registered successfully", user });

});

exports.addVendor = asyncWrapper(async (req, res, next) => {
    const {Name,phoneNumber, email, password} = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    

    // Check if the user already exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
        const err = appError.create("User already exists", 400);
        return next(err);
    }
    // Create a new user

    const user = new User({
        Name,
        email,
        password: hashedPassword,
        role: userRoles.vendor,
        phoneNumber
    });

    // Generate JWT token
    const token = await generateJWT({ email: user.email,id: user._id, role: user.role });
    user.token = token;

    // Save the user to the database
    await user.save();

    res.status(201).json({ data: user});
});


// Retrieve all Tutorials from the database.
// Get all users
exports.getAllUsers = asyncWrapper(async (req, res) => {
    const email = req.query.email;
    const condition = email ? { email: { $regex: email, $options: 'i' } } : {};

    // Find all users with optional search condition
    const users = await User.find(condition).select('-password');  // Exclude password field

    res.status(200).json({ data: users});
});

exports.getAllVendors = asyncWrapper(async (req, res) => {
    // Get pagination parameters from query or default values
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Find vendors with pagination
    const users = await User.find({ role: userRoles.vendor })
        .select('-password') // Exclude password field
        .skip(skip)
        .limit(limit);

    // Count total vendors for pagination metadata
    const totalUsers = await User.countDocuments({ role: userRoles.vendor });
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
        data: users,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalUsers,
            itemsPerPage: limit,
        },
    });
});



// Login user
exports.login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const err = appError.create("Please provide email and password", 400, httpStatusText.FAIL);
        return next(err);
    }

    // Find user by email
    const userdb = await User.findOne({ email });
    if (!userdb) {
        const err = appError.create("Invalid email or password", 400, httpStatusText.FAIL);
        return next(err);
    }

    // Compare password
    const matchedPassword = await bcrypt.compare(password, userdb.password);
    if (matchedPassword) {
        const token = await generateJWT({ email: userdb.email, id: userdb._id,role: userdb.role });
        res.status(200).json({ token, httpStatusText: httpStatusText.SUCCESS });
    } else {
        const err = appError.create("Invalid email or password", 400);
        return next(err);
    }
});

exports.updateVendor = asyncWrapper(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(appError.create('No token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SCREET);
    const id = decoded.id;

    const updatedUser  = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (updatedUser) {
        return res.status(200).json({massage: "User  updated successfully"});
    } else {
        return next(appError.create(`Cannot update User with id=${id}`, 404));
    }
});


exports.deleteVendor = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const vendor = await User.findById(id);
    if (!vendor) {
        return next(appError.create(`Vendor with id=${id} not found, 404`));
    }
    const restaurants = await Restaurant.find({ vendor_id: id });
    if (restaurants.length > 0) {
        for (const restaurant of restaurants) {
            const restaurantId = restaurant._id;
            const tables = await Table.find({ restaurantId });
            const tableIds = tables.map((table) => table._id);
            await Table_Timeslot.deleteMany({ table: { $in: tableIds } });
            await Timeslot.deleteOne({ restaurantId });
            await Table.deleteMany({ restaurantId });
            await Reservation.deleteMany({ restaurantId });
            await dboffer.deleteMany({ restaurantId });
            await Restaurant.deleteOne({ _id: restaurantId });
        }
    }
    await vendor.deleteOne();
    res.status(200).json({
        status: 200,
        message: 'Vendor and all associated resources deleted successfully',
    });
});

exports.getVendorById = asyncWrapper(async (req, res, next) =>{
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(appError.create('No token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SCREET);
    const id = decoded.id;
    const vendor = await User.findById(id);
    if(!vendor){
        return next(appError.create(`User with id ${id} not found`, 404)); 
    }
    res.status(200).json({message: 'User found successfully', data : vendor});
});