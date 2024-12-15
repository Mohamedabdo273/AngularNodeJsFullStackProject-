const mongoose = require('mongoose');
const table_TimeslotSchema = new mongoose.Schema({
    table: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Table', 
        required: true 
    },
    timeslot: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timeslot', 
        required: true 
    },
    isAvailable: { 
        type: Boolean,
        default: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const table_Timeslot = mongoose.model('table_Timeslot', table_TimeslotSchema);
module.exports = table_Timeslot;