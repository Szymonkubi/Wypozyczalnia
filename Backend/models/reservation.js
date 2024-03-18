const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  pickupLocation: String,
  returnLocation: String,
  carModel: String,
  startDate: Date,
  endDate: Date,
  totalCost: Number,
});

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;
