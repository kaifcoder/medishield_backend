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
      html = `Hi, Please follow this link to verify your email address. This link is valid till 10 minutes from now. <a href='${BASE_URL}/api/user/verifyEmail/${emailtoken}'>Click Here</>`
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
      res.send("Email verifified successfully");
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
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const token = await generateToken(findAdmin?._id);
    // const updateuser = await User.findByIdAndUpdate(
    //   findAdmin.id,
    //   {
    //     refreshToken: refreshToken,
    //   },
    //   { new: true }
    // );
    res.cookie("token", refreshToken, {
      httpOnly: true,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
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
        return res.json(updatedCart);
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
        return res.json(updatedCart);
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
      return res.json(newCart);
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


// post checkout order creation
const createOrder = asyncHandler(async (req, res) => {
  const { paymentId, amount, shipping, shippingAddress } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    console.log(userCart);
    // let finalAmout = 0;
    // if (couponApplied && userCart.totalAfterDiscount) {
    //   finalAmout = userCart.totalAfterDiscount;
    // } else {
    //   finalAmout = userCart.cartTotal;
    // }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: paymentId,
        amount: amount,
        shipping: shipping,
        created: Date.now(),
        currency: "INR",
      },
      orderby: user._id,
      orderStatus: "Processing",
      shippingAddress: shippingAddress,
    }).save();
    console.log(newOrder);
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
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
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
  updateAddress
};
