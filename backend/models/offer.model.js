const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    offer: {
        type: String
    },
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    restaurantName: {
        type: String
    }
});
const offer = mongoose.model('offer', offerSchema);
module.exports = offer;