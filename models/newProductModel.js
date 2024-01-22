const mongoose = require('mongoose');

const tierPriceSchema = new mongoose.Schema({
    qty: { type: Number, required: true },
    value: { type: Number, required: true },
});

const mediaGalleryEntrySchema = new mongoose.Schema({
    file: { type: String, required: true },
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const qaDataSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
});

const priceSchema = new mongoose.Schema({
    minimalPrice: { type: Number, required: true },
    maximalPrice: { type: Number, required: true },
    regularPrice: { type: Number, required: true },
});

const productSpecsSchema = new mongoose.Schema({
    description: { type: String, required: true },
    key_specifications: { type: String, required: true },
    packaging: { type: String, required: true },
    direction_to_use: { type: String, required: true },
    features: { type: String, required: true },
});

const childProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image_url: { type: String, required: true },
    sku: { type: String, required: true },
    short_description: { type: String, required: true },
    manufacturer: { type: String, required: true },
    price: {
        minimalPrice: {
            amount: {
                value: { type: Number, required: true },
                currency: { type: String, required: true },
            },
        },
        maximalPrice: {
            amount: {
                value: { type: Number, required: true },
                currency: { type: String, required: true },
            },
        },
        regularPrice: {
            amount: {
                value: { type: Number, required: true },
                currency: { type: String, required: true },
            },
        },
    },
    tier_prices: { type: [{ qty: Number, value: Number }], default: [] },
    media_gallery_entries: { type: [String], default: [] },
});

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    thumbnail_url: { type: String, required: true },
    short_description: { type: String, required: true },
    manufacturer: { type: Number, required: true },
    price: { type: priceSchema, required: true },
    tier_prices: { type: [tierPriceSchema], default: [] },
    media_gallery_entries: { type: [mediaGalleryEntrySchema], default: [] },
    categories: { type: [categorySchema], default: [] },
    qa_data: { type: [qaDataSchema], default: [] },
    product_specs: { type: productSpecsSchema, required: true },
    childProducts: { type: childProductSchema, default: [] },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
