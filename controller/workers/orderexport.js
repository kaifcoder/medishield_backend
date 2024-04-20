const { sendResendEmail } = require("../../utils/sendResendEmail");
const Order = require("../../models/orderModel");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');

mongoose.connect(workerData, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const exportAllOrders = async () => {
    try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all orders that are created today or are in processing state
        const alluserorders = await Order.find({
            $or: [
                { createdAt: { $lt: today }, orderStatus: "Processing" }, // Previous pending orders
                { createdAt: { $gte: today }, orderStatus: "Processing" } // Today's pending orders
            ]
        })
            .populate("products.product")
            .populate("orderby")
            .exec();


        // Prepare CSV data for previous pending orders
        let previousPendingCSV = "Sno,Ordered Date,Customer name,Customer email,Customer Phone,Customer Address,Product name,Product price/unit,Product qty\n";
        // Prepare CSV data for today's pending orders
        let todayPendingCSV = "Sno,Ordered Date,Customer name,Customer email,Customer Phone,Customer Address,Product name,Product price/unit,Product qty\n";

        alluserorders.forEach((order, index) => {
            const orderedDate = order.createdAt.toISOString().split('T')[0];
            const customerName = `${order.orderby.firstname} ${order.orderby.lastname}`;
            const customerEmail = order.orderby.email;
            const customerPhone = order.shippingAddress.mobile || '';;
            const customerAddress = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pincode}, ${order.shippingAddress.country}`;

            order.products.forEach((product) => {
                let productName = product.product.name;
                const productPrice = product.price;
                const productCount = product.count;

                // Check if the product has child products and SKU matches the product variant
                if (product.product.childProducts && product.variant) {
                    const matchingChildProduct = product.product.childProducts.find(child => child.sku === product.variant);
                    if (matchingChildProduct && matchingChildProduct.name) {
                        productName = matchingChildProduct.name;
                    }
                }

                // Determine which CSV data to append based on the creation date of the order
                if (order.createdAt < today) {
                    // Previous pending order
                    previousPendingCSV += `${index + 1},${orderedDate},"${customerName}","${customerEmail}","${customerPhone}","${customerAddress}","${productName}",${productPrice},${productCount}\n`;
                } else {
                    // Today's pending order
                    todayPendingCSV += `${index + 1},${orderedDate},"${customerName}","${customerEmail}","${customerPhone}","${customerAddress}","${productName}",${productPrice},${productCount}\n`;
                }
            });
        });
        // Convert CSV data to file buffer
        const previousPendingBuffer = Buffer.from("Previous Pending Orders\n\n\n" + previousPendingCSV, 'utf-8');
        const todayPendingBuffer = Buffer.from("Today's Pending Orders\n\n\n" + todayPendingCSV, 'utf-8');

        // find emails of all admins from user collection
        const admins = await User.find({ role: "admin" });
        // send mail to each admin
        admins.forEach((admin) => sendResendEmail(
            to = admin.email,
            subject = `Order CSV Report`,
            html = `Find the attached CSV file for today's orders report`,
            attachments = [
                {
                    filename: "previous_pending_orders.csv",
                    content: previousPendingBuffer
                },
                {
                    filename: "today_pending_orders.csv",
                    content: todayPendingBuffer
                }
            ]
        )
        );
        mongoose.disconnect();
        parentPort.postMessage(
            {
                previousPendingCSV,
                todayPendingCSV
            }
        );
    } catch (error) {
        throw new Error(error);
    }
}

exportAllOrders();