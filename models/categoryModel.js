const mongoose = require('mongoose');


// Define the schema for the third level (e.g., Anaesthetics, Mouths gags, ...)
const thirdLevelSchema = new mongoose.Schema({
    id: Number,
    name: String,
    url_path: String,
    level: { type: Number, default: 3 },
    position: Number,
});

// Define the schema for the second level (e.g., Oral Surgery)
const secondLevelSchema = new mongoose.Schema({
    id: Number,
    name: String,
    url_path: String,
    level: { type: Number, default: 2 },
    position: Number,
    children: [thirdLevelSchema], // Array of third level schema
});

// Define the main schema for the entire structure
const mainSchema = new mongoose.Schema({
    id: Number,
    name: String,
    url_path: String,
    level: { type: Number, default: 2 },
    position: Number,
    featured: Boolean,
    children: [secondLevelSchema], // Array of second level schema
});

// Create a model using the main schema
const Category = mongoose.model('Category', mainSchema);

module.exports = Category;
