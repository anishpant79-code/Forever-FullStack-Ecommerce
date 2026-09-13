import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

// Global variables
const currency = "inr";
const deliveryCharge = 50;

// Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =================================
// Placing Orders using COD
// =================================

const placeOrder = async (req, res) => {

    try {

        console.log("===== PLACE ORDER START =====");

        const userId = req.user.id;

        const { items, address, amount } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            status: "Order Placed",
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);

        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, {
            cartData: {}
        });

        res.json({
            success: true,
            message: "Order Placed Successfully"
        });

    } catch (error) {

        console.log("PLACE ORDER ERROR:", error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// =================================
// Placing Orders using Stripe
// =================================

const placeOrderStripe = async (req, res) => {

    try {

        const userId = req.user.id;

        const { items, address, amount } = req.body;

        const { origin } = req.headers;


        // Create order in database

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            status: "Order Placed",
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);

        await newOrder.save();


        // Create Stripe line items

        const line_items = items.map((item) => ({

            price_data: {

                currency: currency,

                product_data: {
                    name: item.name
                },

                unit_amount: Math.round(item.price * 100)

            },

            quantity: item.quantity

        }));


        // Add delivery charge

        line_items.push({

            price_data: {

                currency: currency,

                product_data: {
                    name: "Delivery Charges"
                },

                unit_amount: deliveryCharge * 100

            },

            quantity: 1

        });


        // Create Stripe checkout session

        const session = await stripe.checkout.sessions.create({

            success_url:
                `${origin}/verify?success=true&orderId=${newOrder._id}&userId=${userId}`,

            cancel_url:
                `${origin}/verify?success=false&orderId=${newOrder._id}&userId=${userId}`,

            line_items,

            mode: "payment"

        });


        res.json({

            success: true,

            session_url: session.url

        });


    } catch (error) {

        console.log("STRIPE ORDER ERROR:", error);

        res.json({

            success: false,

            message: error.message

        });

    }
};


// =================================
// Verify Stripe Payment
// =================================

const verifyStripe = async (req, res) => {

    try {

        const { orderId, success, userId } = req.body;


        if (success === "true") {

            // Mark order as paid

            await orderModel.findByIdAndUpdate(

                orderId,

                {
                    payment: true
                }

            );


            // Clear user's cart

            await userModel.findByIdAndUpdate(

                userId,

                {
                    cartData: {}
                }

            );


            res.json({

                success: true,

                message: "Payment Verified Successfully"

            });

        } else {

            // Delete unpaid order

            await orderModel.findByIdAndDelete(orderId);


            res.json({

                success: false,

                message: "Payment Failed"

            });

        }

    } catch (error) {

        console.log("VERIFY STRIPE ERROR:", error);

        res.json({

            success: false,

            message: error.message

        });

    }
};


// =================================
// Placing Orders using Razorpay
// =================================

const placeOrderRazorpay = async (req, res) => {

    try {

        const userId = req.user.id;

        const { items, address, amount } = req.body;

        const orderData = {

            userId,

            items,

            address,

            amount,

            paymentMethod: "Razorpay",

            payment: false,

            status: "Order Placed",

            date: Date.now()

        };

        const newOrder = new orderModel(orderData);

        await newOrder.save();

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.json({ success: false, message: error })

            }
            res.json({ success: true, order })
        })

    } catch (error) {

        console.log("RAZORPAY ORDER ERROR:", error);

        res.json({

            success: false,

            message: error.message

        });

    }

};


// =================================
// All Orders - Admin Panel
// =================================

const allOrders = async (req, res) => {

    try {

        const orders = await orderModel.find({});

        res.json({

            success: true,

            orders

        });

    } catch (error) {

        console.log("ALL ORDERS ERROR:", error);

        res.json({

            success: false,

            message: error.message

        });

    }

};


// =================================
// User Orders - Frontend
// =================================

const userOrders = async (req, res) => {

    try {

        const userId = req.user.id;

        console.log("GET ORDERS USER ID:", userId);

        const orders = await orderModel.find({ userId });

        console.log("USER ORDERS:", orders);


        res.json({

            success: true,

            orders

        });

    } catch (error) {

        console.log("GET ORDERS ERROR:", error);

        res.json({

            success: false,

            message: error.message

        });

    }

};


// =================================
// Update Order Status - Admin
// =================================

const updateStatus = async (req, res) => {

    try {

        const { orderId, status } = req.body;


        await orderModel.findByIdAndUpdate(

            orderId,

            {
                status
            }

        );


        res.json({

            success: true,

            message: "Status Updated"

        });

    } catch (error) {

        console.log("UPDATE STATUS ERROR:", error);

        res.json({

            success: false,

            message: error.message

        });

    }

};

// =================================
// Verify Razorpay Payment
// =================================

const verifyRazorpay = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");

        if (expectedSignature === razorpay_signature) {

            const razorpayOrder =
                await razorpayInstance.orders.fetch(
                    razorpay_order_id
                );

            const orderId =
                razorpayOrder.receipt;

            await orderModel.findByIdAndUpdate(
                orderId,
                {
                    payment: true,
                    status: "Order Placed"
                }
            );

            const order =
                await orderModel.findById(orderId);

            if (order) {

                await userModel.findByIdAndUpdate(
                    order.userId,
                    {
                        cartData: {}
                    }
                );
            }

            res.json({
                success: true,
                message: "Payment Verified Successfully"
            });

        } else {

            res.json({
                success: false,
                message: "Payment verification failed"
            });
        }

    } catch (error) {

        console.log(
            "RAZORPAY VERIFY ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

// =================================
// Export
// =================================

export {
    placeOrder,
    placeOrderStripe,
    verifyStripe,
    placeOrderRazorpay,
    verifyRazorpay,
    allOrders,
    userOrders,
    updateStatus
};