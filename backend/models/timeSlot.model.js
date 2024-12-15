const mongoose = require('mongoose');


const timeslotSchema = new mongoose.Schema({
    timeslots: [
        {
            time: { type: String, required: true },
        }
    ],
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const timeslot = mongoose.model('timeslot', timeslotSchema);
module.exports = timeslot;