const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

mongoose.set('debug', true);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const db = {
    user: require('./user.model.js'),
    restaurant: require('./restaurant.model.js'),
    table: require('./table.model.js'),
    timeslot: require('./timeSlot.model.js'),
    TableTimeslot: require('./TableTimeslot.model'),
    reservation: require('./reservation.model.js'),
    offer: require('./offer.model.js'),
};

module.exports = db;

