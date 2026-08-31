const Event = require("../models/Event");

// Get All Events
exports.getEvents = async (req, res) => {
    try {
        const filters = {};

        if (req.query.category) {
            filters.category = req.query.category;
        }

        if (req.query.search) {
            filters.title = {
                $regex: req.query.search,
                $options: "i",
            };
        }

        const events = await Event.find(filters).populate(
            "createBy",
            "name email"
        );

        res.status(200).json(events);
    } catch (error) {
        console.error("Get Events Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// Get Event By ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate(
            "createBy",
            "name email"
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error("Get Event Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// Create Event
exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            image,
        } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            image,
            createBy: req.user._id,
        });

        res.status(201).json(event);
    } catch (error) {
        console.error("Create Event Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error("Update Event Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        res.status(200).json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Delete Event Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};