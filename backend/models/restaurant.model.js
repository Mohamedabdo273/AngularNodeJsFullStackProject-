const validator = require('validator'); 
const userRoles = require('../utils/userRoles');
const mongoose = require('mongoose');
const foodCategory = require('../utils/foodCategory');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true,"name cannot be empty"],
        minlength: 2,
        maxlength: 255
    },
    description:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        default: '../uploads/Res.png',
    },
    location:{
        type: String,
        required: true
    },
    rating:{
        type: Number,
        required: true,
    },
    latitude:{
        type: String,
        required: true,
        unique : true
    },
    longitude:{
        type: String,
        required: true,
        unique : true
    },
    numberOfTables:{
        type: Number,
    },
    vendor_id:{
        type: mongoose.Schema.Types.ObjectId,
    },
    foodCategory:{
        type: String,
        enum: [foodCategory.seaFood,foodCategory.italian,foodCategory.oriental,foodCategory.Dessert,foodCategory.asian],
    }
},
);
module.exports = mongoose.model('Restaurant', restaurantSchema);