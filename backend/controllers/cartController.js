import userModel from "../models/userModel.js";


// ================================
// ADD PRODUCT TO USER CART
// ================================
const addToCart = async (req, res) => {

    try {

        const { userId, itemId, size } = req.body;

        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        let cartData = userData.cartData || {};


        // If product already exists
        if (cartData[itemId]) {

            // If size already exists
            if (cartData[itemId][size]) {

                cartData[itemId][size] += 1;

            }
            else {

                cartData[itemId][size] = 1;

            }

        }
        else {

            cartData[itemId] = {};
            cartData[itemId][size] = 1;

        }


        await userModel.findByIdAndUpdate(
            userId,
            { cartData }
        );


        res.json({
            success: true,
            message: "Added to Cart"
        });

    }
    catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });

    }

};


// ================================
// UPDATE PRODUCT QUANTITY
// ================================
const updateCart = async (req, res) => {

    try {

        const {
            userId,
            itemId,
            size,
            quantity
        } = req.body;


        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }


        let cartData = userData.cartData || {};


        // Check whether product exists
        if (!cartData[itemId]) {

            return res.json({
                success: false,
                message: "Product not found in cart"
            });

        }


        // ================================
        // REMOVE ITEM WHEN QUANTITY = 0
        // ================================
        if (quantity === 0) {

            delete cartData[itemId][size];


            // If no sizes remain, remove product
            if (Object.keys(cartData[itemId]).length === 0) {

                delete cartData[itemId];

            }

        }
        else {

            cartData[itemId][size] = quantity;

        }


        await userModel.findByIdAndUpdate(
            userId,
            { cartData }
        );


        res.json({
            success: true,
            message: "Cart Updated"
        });

    }
    catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });

    }

};


// ================================
// GET USER CART
// ================================
const getUserCart = async (req, res) => {

    try {

        const { userId } = req.body;


        const userData = await userModel.findById(userId);

        if (!userData) {

            return res.json({
                success: false,
                message: "User not found"
            });

        }


        const cartData = userData.cartData || {};


        res.json({
            success: true,
            cartData
        });

    }
    catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });

    }

};


export {
    addToCart,
    updateCart,
    getUserCart
};