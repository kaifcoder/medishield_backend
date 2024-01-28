const bannerSchema = new mongoose.Schema({
    web_image: String,
    mobile_image: String,
    link: String,
    alt: String,
    small_image: String,
    title: String,
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
});