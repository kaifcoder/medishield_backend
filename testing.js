const { zohoBookApi } = require("./utils/zohoapi");
const axios = require('axios');
const dotenv = require('dotenv');
const User = require("./models/userModel");
const Product = require("./models/productModel");
const Cart = require("./models/cartModel");

const Coupon = require("./models/couponModel");
const Order = require("./models/orderModel");
const dbConnect = require("./config/dbConnect");
dotenv.config();
dbConnect();
const zohoAuthData = {
    client_id: process.env.MEDISHIELD_ZOHO_CLIENT_ID,
    client_secret: process.env.MEDISHIELD_ZOHO_CLIENT_SECRET,
    refresh_token: process.env.MEDISHIELD_ZOHO_REFRESH_TOKEN,
    grant_type: 'refresh_token'
};

const org = process.env.MEDISHIELD_ZOHO_ORG_ID

// plastigin sepetrose
const zohoAuth = async () => {
    // check if access token is present and not expired
    const zohoAuthData = {
        client_id: process.env.MEDISHIELD_ZOHO_CLIENT_ID,
        client_secret: process.env.MEDISHIELD_ZOHO_CLIENT_SECRET,
        refresh_token: process.env.MEDISHIELD_ZOHO_REFRESH_TOKEN,
        grant_type: 'refresh_token'
    };
    const zohoAuthResponse = await axios.post(`
      https://accounts.zoho.in/oauth/v2/token?refresh_token=${zohoAuthData.refresh_token}&client_id=${zohoAuthData.client_id}&client_secret=${zohoAuthData.client_secret}&grant_type=${zohoAuthData.grant_type}
      ` );
    console.log(zohoAuthResponse.data.access_token);
    const accessToken = zohoAuthResponse.data.access_token;
    // store the access token in memory for 1 hour
    accessTokenGlobalzoho = accessToken;
    accessTokenGlobalTimestatmp = Date.now();

    return accessToken;
}

const createOrder = async () => {
    const zohoAuthData = {
        client_id: process.env.MEDISHIELD_ZOHO_CLIENT_ID,
        client_secret: process.env.MEDISHIELD_ZOHO_CLIENT_SECRET,
        refresh_token: process.env.MEDISHIELD_ZOHO_REFRESH_TOKEN,
        grant_type: 'refresh_token'
    };
    // const paymentId = "pay_ORkbfgoVX5Yi4h";
    const amount = 470;
    const shipping = 50;
    // const shippingAddress =
    // {
    //     "name": "Dr. MS Maan",
    //     "address": "maan dental clinic rajendra nagar lucknow",
    //     "mobile": "9839584664",
    //     "city": "Lucknow District",
    //     "state": "Uttar Pradesh",
    //     "country": "India",
    //     "pincode": "226004",
    // }

    // const msc = 0;
    // const orderId = "order_ORkbNWo27Dl2JQ";
    const couponId = null;
    const disc = 180;
    //  find coupon
    let coupon = null;
    if (couponId) {
        coupon = await Coupon.findById(couponId);
        console.log(coupon);
    }
    // verify signatures here
    const accessToken = await zohoAuth();
    const user = await User.findById("667d3a4074830a4fa4e97144");
    let userCart = await Cart.findOne({ orderby: user._id });
    // generate invoice in zoho books
    let customerId = user?.zohoCustomerId;

    // if (!customerId) {
    //     // create customer in zohobooks
    //     const customerPayload = {
    //         contact_name: user.email,
    //         contact_type: 'customer',
    //         contact_subtype: 'individual',
    //         contact_persons: [
    //             {
    //                 first_name: user.firstname,
    //                 last_name: user.lastname,
    //                 email: user?.email,
    //                 phone: user?.mobile,
    //             }
    //         ],
    //     };


    //     const customer = await zohoBookApi.post(`/contacts?organization_id=${org}`, customerPayload,
    //         {
    //             headers: {
    //                 authorization: `Zoho-oauthtoken ${accessToken}`
    //             }
    //         }
    //     );

    //     // update customer id in user


    //     user.zohoCustomerId = customer.data.contact.contact_id;
    //     await user.save();
    //     customerId = customer.data.contact.contact_id;
    // }

    const zohoInvoicePayload = {
        customer_id: customerId,
        salesperson_name: 'APP',
        is_inclusive_tax: true,
        discount: disc,
        is_discount_before_tax: false,
        discount_type: "entity_level",
        shipping_charge: shipping,
        // line_items: userCart.products.map((item) => {
        //     return {
        //         item_id: item.itemId,
        //         quantity: item.count,
        //     };
        // }),
    };
    console.log(zohoInvoicePayload);
    const invoice = await zohoBookApi.put(`/invoices?organization_id=${org}`, zohoInvoicePayload,
        {
            headers: {
                authorization: `Zoho-oauthtoken ${accessToken}`
            }
        });
    console.log(invoice.data.invoice.invoice_id);
    // pay the invoice
    // const invoiceId = invoice.data.invoice.invoice_id;
    // const total = invoice.data.invoice.total;
    // const date = invoice.data.invoice.date;
    // const paymentPayload = {
    //     customer_id: customerId,
    //     payment_mode: "banktransfer",
    //     amount: total,
    //     date: date,
    //     invoice_id: invoiceId,
    //     amount_applied: total,
    //     invoices: [
    //         {
    //             invoice_id: invoiceId,
    //             amount_applied: total
    //         }
    //     ]
    // };
    // const payment = await zohoBookApi.post(`/customerpayments?organization_id=${org}`, paymentPayload,
    //     {
    //         headers: {
    //             authorization: `Zoho-oauthtoken ${accessToken}`
    //         }
    //     });
    // // console.log(payment.data);
    // console.log(payment.data.payment.payment_id);

    // let newOrder = await new Order({
    //     products: userCart.products,
    //     zohoInvoiceId: "1785281000002462001",
    //     zohoPaymentId: "1785281000002446556",
    //     paymentIntent: {
    //         id: paymentId,
    //         rzporderId: orderId,
    //         amount: amount,
    //         shipping: shipping,
    //         msc: msc,
    //         discount: disc,
    //         created: Date.now(),
    //         currency: "INR",
    //     },
    //     orderby: user._id,
    //     couponCodeApplied: couponId ? couponId : null,
    //     orderStatus: "Processing",
    //     shippingAddress: shippingAddress,
    //     couponCode: "MS180",
    //     couponDiscount: 180,
    //     couponType: coupon != null ? coupon.type : null,
    // }).save();

    // //update user's medishield coins
    // user.medishieldcoins = user.medishieldcoins - msc;
    // await user.save();

    // // credit medishield coins to user
    // let prod_msc = 0;
    // const promises = userCart.products.map(async (item) => {
    //     const product = await Product.findById(item.product);
    //     if (!product.medishield_coins) {
    //         console.log("No medishield coins for this product");
    //     }
    //     else {
    //         prod_msc += product.medishield_coins * item.count;
    //         console.log("inner product_msc" + prod_msc);
    //     }
    // });
    // await Promise.all(promises);
    // console.log("Outer product_msc" + prod_msc);
    // user.medishieldcoins = user.medishieldcoins + prod_msc;
    // newuser = await user.save();
    // console.log(newuser);


    // //update stock in product
    // let bulkOption = userCart.products.map((item) => {
    //     return {
    //         updateOne: {
    //             filter: { _id: item.product.toString() },
    //             update: { $inc: { max_sale_qty: -item.count } },
    //         },
    //     };
    // });
    // let updated = await Product.bulkWrite(bulkOption, { new: true });





}

createOrder();