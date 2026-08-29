const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "d:/EVENTORA/server/.env" });

const User = require("./models/User");
const Event = require("./models/Event");

const sampleEvents = [
  {
    title: "Global Tech Innovation Summit 2026",
    description: "Join industry leaders, AI pioneers, and visionary entrepreneurs for a multi-day conference exploring quantum computing, neural networks, and the future of web development.",
    date: new Date("2026-11-15T09:00:00.000Z"),
    location: "Silicon Valley Convention Center, CA",
    category: "Technology",
    totalSeats: 250,
    availableSeats: 180,
    ticketPrice: 499,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Neon Horizon Music & Arts Festival",
    description: "An immersive open-air music experience featuring world-renowned electronic DJs, 3D laser light installations, dynamic art exhibits, and gourmet food trucks.",
    date: new Date("2026-10-20T18:00:00.000Z"),
    location: "Waterfront Arena Grounds, Miami, FL",
    category: "Music",
    totalSeats: 500,
    availableSeats: 420,
    ticketPrice: 120,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "UI/UX & Design Systems Bootcamp",
    description: "Hands-on intensive masterclass on creating accessible design tokens, micro-interactions, responsive grids, and scalable UI component libraries in Figma and Tailwind CSS.",
    date: new Date("2026-09-25T10:00:00.000Z"),
    location: "Metropolitan Design Hub, New York, NY",
    category: "Workshops",
    totalSeats: 60,
    availableSeats: 15,
    ticketPrice: 0,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Venture Capital & Startup Founders Meetup",
    description: "Network with angel investors, VC partners, and fast-growing startup founders. Speed networking sessions followed by live pitch presentations and Q&A panel.",
    date: new Date("2026-10-05T17:30:00.000Z"),
    location: "The Grand Ballroom, Austin, TX",
    category: "Business",
    totalSeats: 120,
    availableSeats: 45,
    ticketPrice: 75,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Modern Digital Photography & Visual Storytelling",
    description: "Learn composition, portrait lighting, street photography techniques, and Adobe Lightroom color grading workflows with award-winning photographers.",
    date: new Date("2026-11-02T11:00:00.000Z"),
    location: "Studio 42 Art Center, Seattle, WA",
    category: "Art",
    totalSeats: 40,
    availableSeats: 8,
    ticketPrice: 0,
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1200&auto=format&fit=crop"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Find or create an admin user to attach as creator
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.findOne({});
    }

    const eventsToInsert = sampleEvents.map(event => ({
      ...event,
      createBy: admin ? admin._id : undefined
    }));

    await Event.deleteMany({});
    const inserted = await Event.insertMany(eventsToInsert);
    console.log(`Successfully seeded ${inserted.length} sample events!`);

  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
