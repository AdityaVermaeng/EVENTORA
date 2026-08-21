const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { protect, admin } = require("../middleware/auth");

// Get All Events
router.get("/", getEvents);

//Get Event By ID
router.get("/:id", getEventById);

// Create Event (Admin only)
router.post("/", protect, admin, createEvent);

// Update Event (Admin only)
router.put("/:id", protect, admin, updateEvent);

// Delete Event (Admin Only)
router.delete("/:id", protect, admin, deleteEvent);

module.exports = router;
