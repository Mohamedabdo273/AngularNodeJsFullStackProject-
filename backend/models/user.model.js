const validator = require('validator'); 
const userRoles = require('../utils/userRoles');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "Field must be a valid email address",
        },
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        unique: true, // Create a unique index
        validate: {
            validator: (v) => validator.isMobilePhone(v, 'ar-EG'),
            message: "Invalid phone number format"
        }
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
    },
    role: {
        type: String,
        required: true,
        default: userRoles.customer,
        enum: [userRoles.customer, userRoles.admin, userRoles.vendor]
    }
});

module.exports = mongoose.model('User', userSchema);
