const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShiprocketAPISchema = new Schema({
    key: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    }
});

const ShiprocketAPI = mongoose.model('ShiprocketAPI', ShiprocketAPISchema);

module.exports = ShiprocketAPI;