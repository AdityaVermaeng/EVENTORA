const Event = require("../models/Event");


exports.getEvents = async (req, res) => {
	try{
		const filters ={};
		if(req.query.category) filters.category = req.query.category;
		if(req.query.search) filters.title = { $regex: req.query.search, $options: "i" };

		const events = await Event.find(filters).populate('createBy', 'name email').res.json(events);
	} catch(error){
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


exports.getEventById = async (req, res) => {
	try{
		const events = await Event.findById(req.params.id).populate('createBy', 'name email');
		if(!event) return res.status(404).json({ message: "Event not found" });
		res.json(events);
	} catch(error){
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


exports.createEvent = async (req, res) => {
	try{
		const { title, description, date, location, category, totalSeats, availableSeats,  ticketPrice , image} = req.body;
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

	} catch(error){
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.updateEvent = async (req, res) => {
	try{
		const event = await Event.findById(req.params.id, req.body, { new: true });
		if(!event) return res.status(404).json({ message: "Event not found" });
		res.json(event);
	}
	catch(error){
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


exports.deleteEvent = async (req, res) => {
	try{
		const event = await Event.findByIdAndDelete(req.params.id);
		if(!event) return res.status(404).json({ message: "Event not found" });
		res.json({ message: "Event deleted successfully" });
	}
	catch(error){
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
