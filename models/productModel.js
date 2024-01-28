const mongoose = require('mongoose');

const mediaEntrySchema = new mongoose.Schema({
  id: Number,
  media_type: String,
  label: String,
  file: String
}, { _id: false });

const categorySchema = new mongoose.Schema({
  name: String
}, { _id: false });

const qaSchema = new mongoose.Schema({
  question: String,
  answer: String,
  like: Number,
  dislike: Number
}, { _id: false });

const priceSchema = new mongoose.Schema({
  minimalPrice: Number,
  maximalPrice: Number,
  regularPrice: Number
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  sku: String,
  thumbnail_url: String,
  short_description: String,
  MediShieldCoin: Number,
  manufacturer: String,
  average_rating: String,
  rating_count: String,
  is_in_stock: Boolean,
  is_cod: String,
  weight: String,
  max_sale_qty: Number,
  pd_expiry_date: Date,
  price: priceSchema,
  media_gallery_entries: [mediaEntrySchema],
  categories: [categorySchema],
  qa_data: [qaSchema],
  product_specs: {
    description: String,
    key_specifications: String,
    packaging: String,
    direction_to_use: String,
    features: String
  },
  banners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banner'
  }],
  featured: Boolean,
  childProducts: [{
    id: Number,
    image_url: String,
    name: String,
    sku: String,
    special_price: Number,
    short_description: String,
    manufacturer: String,
    average_rating: String,
    rating_count: String,
    is_in_stock: Boolean,
    pd_expiry_date: Date,
    price: priceSchema,
    media_gallery_entries: [mediaEntrySchema],
    categories: [String]
  }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
