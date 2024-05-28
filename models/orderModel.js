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
    zohoInvoiceId: {
      type: String,
    },
    zohoPaymentId: {
      type: String,
    },
    orderStatus: {
      type: String,
      default: "Processing",
      enum: [
        "Not Processed", // Payment not received
        "Processing",
        "Shipped", // AWB number -> order update
        "Delivered",
        "Cancelled",
      ],
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trackingNumber: {
      type: String,
    },
    shipmentInfo: {
      type: {},
    },
    shippingAddress: {
      type: {},
      ref: "Address",
    },
    couponCodeApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    couponCode: {
      type: String,
    },
    couponDiscount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
