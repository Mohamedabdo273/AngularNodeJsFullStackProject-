
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    capacity: {
        type: Number,
        required: true,
        defaultValue: 6
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId, 
    },
    tableNumber:{
        type:Number,
    }
});

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;