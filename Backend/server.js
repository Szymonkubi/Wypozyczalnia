const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const connectionString =
  "PodmienConnectionString";

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB Atlas", err));

app.get("/", (req, res) => {
  res.send("Tesla Rental Backend is up and running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const Reservation = require("./models/reservation");

app.post("/reservations", async (req, res) => {
  const reservation = new Reservation(req.body);
  try {
    await reservation.save();
    res.status(201).send(reservation);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/reservations", async (req, res) => {
  try {
    const reservations = await Reservation.find({});
    res.status(200).send(reservations);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/check-availability", async (req, res) => {
  const { carModel, startDate, endDate } = req.body;

  try {
    const overlappingReservations = await Reservation.find({
      carModel,
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    });

    if (overlappingReservations.length > 0) {
      res.json({ isAvailable: false });
    } else {
      res.json({ isAvailable: true });
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
