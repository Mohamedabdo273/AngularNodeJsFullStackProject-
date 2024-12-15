const cron = require('node-cron');
const Timeslot = require('../models/timeSlot.model.js');
const Table_Timeslot = require('../models/TableTimeslot.model.js');

cron.schedule('* * * * *', async () => {
    try {
        console.log('Cron job triggered for cleanup...');
        
        // Calculate expired timestamp (1 minute ago)
        const expiredTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find expired timeslots based on 'createdAt' field
        const expiredTimeslots = await Timeslot.find({ createdAt: { $lte: expiredTimestamp } });

        if (expiredTimeslots.length > 0) {
            // Get all individual timeslot _ids from the expired timeslots
            const expiredTimeslotIds = expiredTimeslots.flatMap(timeslot => timeslot.timeslots.map(ts => ts._id));
            console.log('Expired Timeslot IDs:', expiredTimeslotIds);

            // Log the Table_Timeslot query
            console.log("Attempting to delete Table_Timeslot entries for expired Timeslot IDs:", expiredTimeslotIds);

            // Log the query to find Table_Timeslot records
            const tableTimeslotsQuery = {
                timeslot: { $in: expiredTimeslotIds },
                createdAt: { $lte: expiredTimestamp }, // Ensure that the Table_Timeslot is also expired
            };
            console.log("Table_Timeslot delete query:", JSON.stringify(tableTimeslotsQuery));

            // Delete associated table_timeslots first
            const deletedTableTimeslots = await Table_Timeslot.deleteMany(tableTimeslotsQuery);

            // Check if any Table_Timeslot were deleted
            if (deletedTableTimeslots.deletedCount > 0) {
                console.log(`${deletedTableTimeslots.deletedCount} associated Table_Timeslot records deleted`);
            } else {
                console.log("No Table_Timeslot records found for the expired Timeslot IDs.");
            }

            // Now, delete the expired timeslots themselves
            const deletedTimeslots = await Timeslot.deleteMany({ _id: { $in: expiredTimeslots.map(ts => ts._id) } });
            console.log(`${deletedTimeslots.deletedCount} expired Timeslots deleted`);
        } else {
            console.log('No expired Timeslots found.');
        }
    } catch (error) {
        console.error('Error during cron job execution:', error.message);
    }
});