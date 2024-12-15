const mongoose = require('mongoose');
const table_Timeslot = require('./TableTimeslot.model');

const reservationSchema = new mongoose.Schema({
    restaurantName : {
        type : String
    },
    tableNumber : {
        type : Number
    },
    timeslot : {
        type : String
    },
    customerName : {
        type : String
    },
    customerPhone : {
        type : String
    },
    customerEmail : {
        type : String
    },
    reservationDate : {
        type : Date
    },
    reservationTime : {
        type : String
    },
    status : {
        type : String,
    },
    tableTimeslotId :{
        type : mongoose.Schema.Types.ObjectId,
    },
    customerId : {
        type : mongoose.Schema.Types.ObjectId,
    },
    restaurantId :{
        type : mongoose.Schema.Types.ObjectId,
    },
    confirmationEmailSent: {
        type: Boolean,
        default: false,
    },
    billSent: {
        type: Boolean,
        default: false,
    },
});
const reservation = mongoose.model('reservation', reservationSchema);
module.exports = reservation;