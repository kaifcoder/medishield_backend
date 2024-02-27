const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModal");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendResendEmail } = require("../utils/sendResendEmail");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    // give user 100 coins for signup
    const user = await User.findById(newUser._id);
    user.medishieldcoins = 50;
    // generate referral code
    const referralCode = user._id.toString().slice(0, 9);
    user.referralCode = referralCode;
    await user.save();
    // give referrer 100 coins for referring
    let referer = req.body.referralCode;
    if (referer) {
      const referrer = await User
        .findOne({ referralCode: referer });
      if (referrer) {
        referrer.medishieldcoins = referrer.medishieldcoins + 100;
        await referrer.save();
      }
    }
    res.json({
      newUser,
      token: generateToken(newUser?._id),
      email: newUser?.email,
    });
  } else {
    throw new Error("User Already Exists Please Login");
  }
});

const isEmailVerified = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded?.id);
  if (user.isEmailVerified) {
    res.json({
      message: "true"
    })
  }
  else {
    res.json({
      message: "false"
    })
  }
});


const sendVerificationEmail = asyncHandler(async (req, res) => {
  const token = req.params.id;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded?.id);
  const emailtoken = jwt.sign({
    data: user.email
  }, process.env.JWT_SECRET, { expiresIn: '10m' });
  try {
    await sendResendEmail(
      to = user.email,
      subject = "Email Verification",
      html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
              /* Reset styles */
              body, table, td, a {
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
              }
      
              table, td {
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
              }
      
              img {
                  -ms-interpolation-mode: bicubic;
              }
      
              /* Template styles */
              body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
      
              table {
                  width: 100%;
                  background-color: #ffffff;
              }
      
              td {
                  padding: 20px;
              }
      
              .header {
                  background-color: #333333;
                  color: #ffffff;
                  text-align: center;
              }
      
              .content {
                  padding-top: 30px;
                  padding-bottom: 30px;
                  text-align: center;
              }
      
              .footer {
                  background-color: #333333;
                  color: #ffffff;
                  text-align: center;
              }
      
              @media only screen and (max-width: 600px) {
                  /* Adjust table sizes for mobile */
                  table {
                      width: 100%;
                  }
      
                  .content {
                      padding-left: 10px;
                      padding-right: 10px;
                  }
              }
          </style>
      </head>
      <body>
          <table>
              <tr>
                  <td class="header">
                      <h1>Email Verification</h1>
                  </td>
              </tr>
              <tr>
                  <td class="content">
                      <p>Hi,</p>
                      <p>Please follow this link to verify your email address. This link is valid for the next 10 minutes:</p>
                      <p><a href="${BASE_URL}/api/user/verifyEmail/${emailtoken}">Click Here</a></p>
                  </td>
              </tr>
              <tr>
                  <td class="footer">
                      <p>Thank you!</p>
                      <p>MediShield Healthcare PVT. LTD.</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `
    )
    res.json({
      message: "Email Sent"
    })
  } catch (error) {
    throw new Error(error);
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const verificationToken = req.params.token;
  const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
  const user = await User.find({ email: decoded.data });
  // Verifying the JWT token  
  jwt.verify(verificationToken, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      console.log(err);
      res.send("Email verification failed, possibly the link is invalid or expired");
    }
    else {
      // Rendering a beautiful card in HTML
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }

            .card {
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              padding: 20px;
              margin: 20px auto;
              max-width: 400px;
              text-align: center;
            }

            h1 {
              color: #333333;
            }

            p {
              color: #555555;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Email Verified Successfully</h1>
            <p>Your email has been successfully verified.</p>
          </div>
        </body>
        </html>
      `;

      // Sending the HTML response
      res.send(htmlResponse);
      User.updateOne({ email: decoded.data }, { isEmailVerified: true }, function (err, result) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Email verification status updated successfully");
        }
      });
    }
  });
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   maxAge: 72 * 60 * 60 * 1000,
    // });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// google uid token login
const loginWithGoogle = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  // check if user exists or not
  const user = await User.findOne({ googleAuthToken: uid });
  console.log(user);
  if (user) {
    res.json({
      _id: user?._id,
      firstname: user?.firstname,
      lastname: user?.lastname,
      email: user?.email,
      mobile: user?.mobile,
      isEmailVerified: user?.isEmailVerified,
      token: generateToken(user?._id),
    });
  } else {
    throw new Error("Google Signin Failed Please use normal login");
  }
});

const isUserExists = asyncHandler(async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ googleAuthToken: uid });
    console.log(user);
    if (user) {
      res.json({
        status: true
      });
    } else {
      res.json({
        status: false
      });
    }
  } catch (error) {
    throw new Error('User not found');
  }
});


const getUser = asyncHandler(async (req, res) => {
  const email = req.params.email;
  try {
    const user = await User.findOne({ email: email });
    res.json(user);
  } catch (error) {
    res.json({
      error: error
    });
  }
});

// admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (!findAdmin) throw new Error("User Not Found");
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const token = await generateToken(findAdmin?._id);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: token,
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user
const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user Address
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const existingAddress = await Address.findOne({ address: req?.body?.address });
    if (!existingAddress) {
      const address = await new Address(req.body).save();
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          $push: { address: address._id },
        },
        {
          new: true,
        }
      );
      res.json({ data: updatedUser.address });
    } else {
      throw new Error("Address Already Exists");
    }
  } catch (error) {
    throw new Error(error);
  }
});



const getAddresses = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id).populate("address");
    res.json({ "data": user.address });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const address = await Address.findByIdAndRemove(id);
    const user = await User.findOneAndUpdate(
      { address: id },
      { $pull: { address: address._id } },
      { new: true }
    );
    res.json({ data: address });
  } catch (error) {
    throw new Error(error);
  }
});

const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const address = await Address.findByIdAndUpdate
      (id,
        {
          name: req?.body?.name,
          address: req?.body?.address,
          mobile: req?.body?.mobile,
          city: req?.body?.city,
          state: req?.body?.state,
          country: req?.body?.country,
          pincode: req?.body?.pincode,
        },
        {
          new: true,
        }
      );
    res.json({ data: address });
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find({});
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});


const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.deleteOne({ email: id });
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});


const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
    
        .container {
          text-align: center;
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          width: 300px;
        }
    
        h1 {
          color: #333;
        }
    
        p {
          color: #555;
          margin-top: 10px;
          margin-bottom: 20px;
        }
    
        a.button {
          display: inline-block;
          background-color: #3498db;
          color: #fff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
    
        a.button:hover {
          background-color: #2980b9;
        }
    
       
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Reset</h1>
        <p>Hi, Please follow this link to reset your password. This link is valid for the next 10 minutes.</p>
        <a href='${BASE_URL}/api/user/reset-password/${token}' class="button">Click Here</a>
      </div>
    </body>
    </html>
    `;

    sendResendEmail(
      to = user.email,
      subject = "Forgot Password Link",
      html = resetURL,
    );
    res.json({ "token": token });
  } catch (error) {
    throw new Error(error);
  }
});

const resetPasswordForm = asyncHandler(async (req, res) => {
  const { token } = req.params;
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
  
      .container {
        text-align: center;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        width: 300px;
      }
  
      h1 {
        color: #333;
      }
  
      form {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
  
      label {
        margin-top: 10px;
        color: #555;
      }
  
      input {
        width: 100%;
        padding: 10px;
        margin-top: 5px;
        margin-bottom: 15px;
        box-sizing: border-box;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
  
      button {
        background-color: #3498db;
        color: #fff;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
  
      button:hover {
        background-color: #2980b9;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Password Reset</h1>
      <form action="${BASE_URL}/api/user/reset-password/${token}" method="post">
        <label for="password">New Password:</label>
        <input type="password" id="password" name="password" required>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  </body>
  </html>  
  `);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // res.json(user);
  res.send(
    `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .container {
      text-align: center;
      background-color: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
    }

    p {
      color: #555;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Changed Successfully</h1>
    <p>Your password has been changed successfully. You can now log in with your new password.</p>
  </div>
</body>
</html>
    `
  )
});



const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json({ "data": findUser.wishlist });
  } catch (error) {
    throw new Error(error);
  }
});


// user cart
const userCart = asyncHandler(async (req, res) => {
  const { product } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      const productExist = alreadyExistCart.products.find(
        (p) => p.variant == product.variant
      );

      if (productExist) {
        console.log("product exist")
        console.log(productExist);
        console.log(product.price * product.count);
        console.log(alreadyExistCart.cartTotal + product.price * product.count)
        const updatedCart = await Cart.findOneAndUpdate(
          {
            orderby: user._id,
            "products.variant": product.variant,
          },
          {
            $inc: {
              "products.$.count": product.count,
              cartTotal: product.price * product.count
            },
          },
          { new: true }
        );
        return res.json(await updatedCart.populate("products.product"));
      } else {
        console.log("product not exist")
        console.log(product)
        const updatedCart = await Cart.findOneAndUpdate(
          { orderby: user._id },
          {
            $push: {
              products: {
                product: product.productId,
                count: product.count,
                variant: product.variant,
                price: product.price,
              },
            },
            $set: { cartTotal: alreadyExistCart.cartTotal + product.price * product.count }
          },
          { new: true }
        );
        return res.json(await updatedCart.populate("products.product"));
      }
    }
    else {
      console.log("no cart found")
      cartTotal = product.price * product.count;
      let newCart = await new Cart({
        products: [
          {
            product: product.productId,
            count: product.count,
            variant: product.variant,
            price: product.price,
          },
        ],
        cartTotal,
        orderby: user?._id,
      }).save();
      result = await newCart.populate("products.product");
      return res.json(result);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { product } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      const productExist = alreadyExistCart.products.find(
        (p) => p.variant == product.variant
      );

      console.log(productExist);
      console.log(productExist.count * productExist.price);
      if (productExist) {
        const updatedCart = await Cart.findOneAndUpdate(
          {
            orderby: user._id,
            "products.variant": product.variant,
          },
          {
            $set: {
              cartTotal: alreadyExistCart.cartTotal - productExist.price * productExist.count
            },
            $pull: {
              "products": productExist,
            }
          },
          { new: true }
        );

        return res.json(updatedCart);
      }
    } else {
      throw new Error("No Cart Found");
    }

  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json({ "data": cart });
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const Razorpay = require('razorpay');
  var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

  var options = {
    amount: Number(req.body.amount * 100),
    currency: req.body.currency,
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.json(order);
  });
});

function verifyPaymentSignature(order_id, razorpay_payment_id, razorpay_signature) {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  const data = `${order_id}|${razorpay_payment_id}`;
  const generated_signature = hmac.update(data).digest('hex');

  if (generated_signature === razorpay_signature) {
    console.log("Payment is successful");
    return true;
  } else {
    console.log("Invalid signature. Payment failed.");
    return false;
  }
}
// post checkout order creation
const createOrder = asyncHandler(async (req, res) => {
  const { paymentId, amount, shipping, shippingAddress, msc, orderId, paymentSignature } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    // verify signatures here
    const isAuthentic = verifyPaymentSignature(orderId, paymentId, paymentSignature);
    if (!isAuthentic) {
      throw new Error("Payment Signature is not authentic invalid payment");
    }


    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });


    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: paymentId,
        rzporderId: orderId,
        amount: amount,
        shipping: shipping,
        msc: msc,
        created: Date.now(),
        currency: "INR",
      },
      orderby: user._id,
      orderStatus: "Processing",
      shippingAddress: shippingAddress,
    }).save();

    //update user's medishield coins
    user.medishieldcoins = user.medishieldcoins - msc * 10;
    await user.save();

    // get the product coins from user's cart product and update user's medishield coins
    // product ids are in userCart.products.product
    // populate the product and get the msc and update user's medishield coins
    // if product do not contain msc then default to 0
    let prod_msc = 0;
    userCart.products.forEach(async (item) => {
      let product = await Product
        .findById(item.product);
      if (product.medishield_coins) {
        prod_msc = prod_msc + product.medishield_coins;
      }
      else {
        prod_msc = prod_msc + 0;
      }
    });
    user.medishieldcoins = user.medishieldcoins + prod_msc;
    await user.save();

    //update stock in product
    let bulkOption = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product.toString() },
          update: { $inc: { max_sale_qty: -item.count } },
        },
      };
    });
    let updated = await Product.bulkWrite(bulkOption, { new: true });


    // send emails to user
    sendResendEmail(
      to = user.email,
      subject = `Order Placed ${newOrder._id}`,
      html = `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
      
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
      
              h1 {
                  color: #333333;
              }
      
              p {
                  color: #666666;
              }
      
              .order-id {
                  font-weight: bold;
                  color: #007bff;
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <h1>Your Order Confirmation</h1>
              <p>Hi,</p>
              <p>Your order has been placed successfully.</p>
              <p>Your order ID is: <span class="order-id">${newOrder._id}</span></p>
              <p>Amount: ${amount} INR</p>
              <p>Shipping Address: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country} - ${shippingAddress.pincode}</p>
              <p> Earned Medishield Coins: ${prod_msc}</p>
              <p>You will receive a confirmation email once your items have been shipped.</p>
              <p>Thank you for shopping with us!</p>
          </div>
      </body>
      
      </html>
      `
    );

    // find emails of all admins from user collection
    const admins = await User.find({ role: "admin" });
    // send emails to admin
    admins.forEach(async (admin) =>
      await sendResendEmail(
        to = admin.email,
        subject = `New Order Arrived ${newOrder._id}`,
        html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Notification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
      
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
      
              h1 {
                  color: #333333;
              }
      
              p {
                  color: #666666;
              }
      
              .order-details {
                  margin-top: 20px;
                  padding: 10px;
                  background-color: #f9f9f9;
                  border-radius: 8px;
              }
      
              .order-id,
              .amount {
                  font-weight: bold;
                  color: #007bff;
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <h1>New Order Notification</h1>
              <p>Hi admin,</p>
              <p>A new order has been placed with the following details:</p>
      
              <div class="order-details">
                  <p><span class="label">Order ID:</span> <span class="order-id">${newOrder._id}</span></p>
                  <p><span class="label">Amount:</span> <span class="amount">${amount} INR</span></p>
                  <p><span class="label">Customer Name:</span> ${shippingAddress.name}</p>
                  <p><span class="label">Email:</span> ${user.email}</p>
                  <p><span class="label">Mobile:</span> ${shippingAddress.mobile}</p>
                  <p><span class="label">Shipping Address:</span> ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country} - ${shippingAddress.pincode}</p>
              </div>
              <p>please check the admin dashboard for more details</p>
          </div>
      </body>
      </html>
      `
      ));

    res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
  }
});

// get all orders for user
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.find({ orderby: _id },)
      .populate("products.product")
      .populate("orderby")
      .exec();
    const userordersinreverse = userorders.reverse();
    res.json({ 'data': userordersinreverse });
  } catch (error) {
    throw new Error(error);
  }
});


// get all orders for admin
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});


const getMostBoughtProducts = asyncHandler(async (req, res) => {
  try {
    const pipeline = [
      {
        $unwind: '$products'
      },
      {
        $group: {
          _id: '$products.product',
          totalQuantity: { $sum: '$products.count' }
        }
      },
      {
        $lookup: {
          from: 'products', // Assuming your products collection name is 'products'
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $unwind: '$productInfo'
      },
      {
        $replaceRoot: { newRoot: '$productInfo' } // Replace the root document with the productInfo
      },
      {
        $addFields: { totalQuantity: '$totalQuantity' } // Add the total quantity field
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10 // You can adjust this limit based on how many top products you want to fetch
      }
    ];

    const result = await Order.aggregate(pipeline);
    res.json(result);
  } catch (error) {
    throw new Error(error);
  }
});

// get all orders
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingnumber } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        trackingNumber: trackingnumber,
      },
      { new: true }
    ).populate("orderby").exec();

    sendResendEmail(
      to = updateOrderStatus.orderby.email,
      subject = `Order Status Updated ${updateOrderStatus._id}`,
      html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Update Notification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #fff;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #333;
              }
              p {
                  margin-bottom: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Order Update Notification</h1>
              <p>Dear Customer,</p>
              <p>We are pleased to inform you that your order with Order ID: <strong>${updateOrderStatus._id}</strong> has been updated.</p>
              <p><strong>Order Status:</strong> ${status}</p>
              <p><strong>Tracking Number:</strong> ${trackingnumber}</p>
              <p>Thank you for choosing us. Should you have any questions or concerns, please feel free to contact our customer service team.</p>
              <p>Warm regards,</p>
              <p><em>MediShield Healthcare PVT. LTD.</em></p>
          </div>
      </body>
      </html>
      `
    )

    res.json(updateOrderStatus);

  } catch (error) {
    throw new Error(error);
  }
});

const getSingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const order = await Order.findById(id)
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(order);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
  isEmailVerified,
  sendVerificationEmail,
  verifyEmail,
  loginWithGoogle,
  isUserExists,
  getUser,
  resetPasswordForm,
  removeCartItem,
  getAddresses,
  deleteAddress,
  updateAddress,
  getSingleOrder,
  getMostBoughtProducts,
  createRazorpayOrder
};
