const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({

    mobile_image: String,

    title: String,
    id: String,
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
