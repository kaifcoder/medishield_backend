const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
        variant: String,
        price: Number
      },
    ],
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Processing",
      enum: [
        "Processing",
        "Shipped", // AWB number -> order update
        "Delivered",
      ],
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trackingNumber: {
      type: String,
    },
    shippingAddress: {
      type: {},
      ref: "Address",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
