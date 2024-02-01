const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    web_image: String,
    mobile_image: String,
    link: String,
    alt: String,
    small_image: String,
    title: String,
    id: Number,
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
