const express = require("express");
require('dotenv').config({ path: './.env' });
const cors = require("cors");
const app = express();
const swaggerSetup = require('./swagger');
const connectToDatabase = require('./models/db.js');
const usersRouter = require('./routes/user.routes');
const restaurantsRouter = require('./routes/restaurant.routes');
const tablesRouter = require('./routes/table.routes');
const TableTimeslotRouter = require('./routes/TableTimeslot.routes.js');
const timeslotRouter = require('./routes/timeslot.routes.js');
const reservationRouter = require('./routes/reservation.routes.js');
const path = require('path');
const corsOptions = { origin: "http://localhost:52264" };
const httpstatustext = require('./utils/httpStatusText');
app.use(cors(corsOptions));
const offerRouter = require("./routes/offer.routes.js");
const { connectRedis } = require('./models/redisClient.js');
// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routers
app.use('/api/users',usersRouter);
app.use('/api/tables',tablesRouter);
app.use('/api/restaurants',restaurantsRouter);
app.use('/api/TableTimeslot',TableTimeslotRouter);
app.use('/api/timeslot',timeslotRouter);
require('./scheduler/cleanupTimeslots');
app.use('/api/reservation',reservationRouter);
app.use('/api/offer',offerRouter);
swaggerSetup(app);

// Error handling middleware
app.all('*', (req, res) => {
  const statusCode = 404;
  return res.status(statusCode).json({
      status: statusCode,
      message: "The Url " + httpstatustext.getStatusText(statusCode),
      category: httpstatustext.getStatusCategory(statusCode)
  });
});
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  const message = error.message || "An unexpected error occurred.";
  return res.status(statusCode).json({
      status: statusCode,
      message: message,
      category: httpstatustext.getStatusCategory(statusCode)
  });
});
// Set port, listen for requests
// Connect to database and start the server
connectRedis();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});


