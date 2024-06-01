const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    mobile_image: String,
    title: String,
    id: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
