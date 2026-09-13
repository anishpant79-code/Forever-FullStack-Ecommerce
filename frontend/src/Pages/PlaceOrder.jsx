import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

import Title from '../Components/Title'
import CartTotal from '../Components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../Context/ShopContext'


const PlaceOrder = () => {

    const [method, setMethod] = useState('cod')

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })


    const {
        navigate,
        backendUrl,
        token,
        cartItems,
        setCartItems,
        getCartAmount,
        delivery_fee,
        products
    } = useContext(ShopContext)


    // =========================================
    // HANDLE INPUT CHANGE
    // =========================================

    const onChangeHandler = (e) => {

        const name = e.target.name
        const value = e.target.value

        setFormData((data) => ({
            ...data,
            [name]: value
        }))
    }


    // =========================================
    // LOAD RAZORPAY SCRIPT
    // =========================================

    const loadRazorpay = () => {

        return new Promise((resolve) => {

            // If Razorpay is already loaded
            if (window.Razorpay) {
                resolve(true)
                return
            }

            const script = document.createElement('script')

            script.src =
                'https://checkout.razorpay.com/v1/checkout.js'

            script.onload = () => {
                resolve(true)
            }

            script.onerror = () => {
                resolve(false)
            }

            document.body.appendChild(script)
        })
    }


    // =========================================
    // PLACE ORDER
    // =========================================

    const onSubmitHandler = async (e) => {

        e.preventDefault()

        try {

            // =========================================
            // CREATE ORDER ITEMS
            // =========================================

            let orderItems = []

            for (const items in cartItems) {

                for (const item in cartItems[items]) {

                    if (cartItems[items][item] > 0) {

                        const itemInfo = structuredClone(
                            products.find(
                                (product) => product._id === items
                            )
                        )

                        if (itemInfo) {

                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]

                            orderItems.push(itemInfo)
                        }
                    }
                }
            }


            // =========================================
            // ORDER DATA
            // =========================================

            const orderData = {

                address: formData,

                items: orderItems,

                amount: getCartAmount() + delivery_fee
            }


            console.log('=================================')
            console.log('ORDER DATA:', orderData)
            console.log('TOKEN:', token)
            console.log('PAYMENT METHOD:', method)
            console.log('=================================')


            // =========================================
            // CASH ON DELIVERY
            // =========================================

            if (method === 'cod') {

                const response = await axios.post(

                    backendUrl + '/api/order/place',

                    orderData,

                    {
                        headers: {
                            token: token
                        }
                    }
                )


                console.log(
                    'PLACE ORDER RESPONSE:',
                    response.data
                )


                if (response.data.success) {

                    setCartItems({})

                    toast.success(
                        response.data.message
                    )

                    navigate('/orders')

                } else {

                    toast.error(
                        response.data.message
                    )
                }
            }


            // =========================================
            // STRIPE
            // =========================================

            else if (method === 'stripe') {

                const response = await axios.post(

                    backendUrl + '/api/order/stripe',

                    orderData,

                    {
                        headers: {
                            token: token
                        }
                    }
                )


                console.log(
                    'STRIPE RESPONSE:',
                    response.data
                )


                if (response.data.success) {

                    window.location.replace(
                        response.data.session_url
                    )

                } else {

                    toast.error(
                        response.data.message
                    )
                }
            }


            // =========================================
            // RAZORPAY
            // =========================================

            else if (method === 'razorpay') {

                console.log('RAZORPAY PAYMENT STARTED')


                // -----------------------------------------
                // STEP 1: LOAD RAZORPAY CHECKOUT
                // -----------------------------------------

                const razorpayLoaded =
                    await loadRazorpay()


                if (!razorpayLoaded) {

                    toast.error(
                        'Razorpay SDK failed to load'
                    )

                    return
                }


                // -----------------------------------------
                // STEP 2: CREATE RAZORPAY ORDER
                // -----------------------------------------

                const response = await axios.post(

                    backendUrl + '/api/order/razorpay',

                    orderData,

                    {
                        headers: {
                            token: token
                        }
                    }
                )


                console.log(
                    'RAZORPAY RESPONSE:',
                    response.data
                )


                // -----------------------------------------
                // CHECK BACKEND RESPONSE
                // -----------------------------------------

                if (!response.data.success) {

                    toast.error(
                        response.data.message
                    )

                    return
                }


                // -----------------------------------------
                // RAZORPAY ORDER
                // -----------------------------------------

                const razorpayOrder =
                    response.data.order


                console.log(
                    'RAZORPAY ORDER:',
                    razorpayOrder
                )


                // -----------------------------------------
                // STEP 3: RAZORPAY CHECKOUT OPTIONS
                // -----------------------------------------

                const options = {

                    // IMPORTANT:
                    // Only Key ID goes in frontend
                    key:
                        import.meta.env
                            .VITE_RAZORPAY_KEY_ID,

                    amount:
                        razorpayOrder.amount,

                    currency:
                        razorpayOrder.currency,

                    name:
                        'Forever',

                    description:
                        'Forever E-Commerce Order',

                    order_id:
                        razorpayOrder.id,


                    // -----------------------------------------
                    // CUSTOMER INFORMATION
                    // -----------------------------------------

                    prefill: {

                        name:
                            formData.firstName +
                            ' ' +
                            formData.lastName,

                        email:
                            formData.email,

                        contact:
                            formData.phone
                    },


                    // -----------------------------------------
                    // NOTES
                    // -----------------------------------------

                    notes: {

                        address:
                            formData.street,

                        city:
                            formData.city,

                        state:
                            formData.state,

                        zipcode:
                            formData.zipcode,

                        country:
                            formData.country
                    },


                    // -----------------------------------------
                    // THEME
                    // -----------------------------------------

                    theme: {

                        color: '#000000'
                    },


                    // -----------------------------------------
                    // PAYMENT SUCCESS
                    // -----------------------------------------

                    handler: async function (
                        paymentResponse
                    ) {

                        console.log(
                            '================================='
                        )

                        console.log(
                            'RAZORPAY PAYMENT SUCCESS'
                        )

                        console.log(
                            'PAYMENT RESPONSE:',
                            paymentResponse
                        )

                        console.log(
                            '================================='
                        )


                        try {

                            // -----------------------------------------
                            // STEP 4: VERIFY PAYMENT
                            // -----------------------------------------

                            const verifyResponse =
                                await axios.post(

                                    backendUrl +
                                    '/api/order/verify-razorpay',

                                    {

                                        razorpay_order_id:
                                            paymentResponse
                                                .razorpay_order_id,

                                        razorpay_payment_id:
                                            paymentResponse
                                                .razorpay_payment_id,

                                        razorpay_signature:
                                            paymentResponse
                                                .razorpay_signature
                                    },

                                    {

                                        headers: {
                                            token: token
                                        }
                                    }
                                )


                            console.log(
                                'VERIFY RESPONSE:',
                                verifyResponse.data
                            )


                            // -----------------------------------------
                            // PAYMENT VERIFIED
                            // -----------------------------------------

                            if (
                                verifyResponse
                                    .data
                                    .success
                            ) {

                                setCartItems({})

                                toast.success(
                                    'Payment successful! Order placed.'
                                )

                                navigate('/orders')

                            }

                            // -----------------------------------------
                            // PAYMENT VERIFICATION FAILED
                            // -----------------------------------------

                            else {

                                toast.error(
                                    verifyResponse
                                        .data
                                        .message ||
                                    'Payment verification failed'
                                )
                            }


                        } catch (error) {

                            console.log(
                                'RAZORPAY VERIFY ERROR:',
                                error
                            )


                            toast.error(

                                error
                                    .response
                                    ?.data
                                    ?.message ||

                                error.message ||

                                'Payment verification failed'
                            )
                        }
                    },


                    // -----------------------------------------
                    // RAZORPAY MODAL CLOSED
                    // -----------------------------------------

                    modal: {

                        ondismiss: function () {

                            console.log(
                                'Razorpay checkout closed'
                            )
                        }
                    }
                }


                // -----------------------------------------
                // STEP 5: CREATE RAZORPAY INSTANCE
                // -----------------------------------------

                const razorpay =
                    new window.Razorpay(options)


                // -----------------------------------------
                // PAYMENT FAILED
                // -----------------------------------------

                razorpay.on(
                    'payment.failed',

                    function (response) {

                        console.log(
                            'PAYMENT FAILED:',
                            response.error
                        )


                        toast.error(

                            response
                                .error
                                ?.description ||

                            'Payment failed'
                        )
                    }
                )


                // -----------------------------------------
                // STEP 6: OPEN RAZORPAY
                // -----------------------------------------

                razorpay.open()
            }


        } catch (error) {

            console.log(
                'PLACE ORDER ERROR:',
                error
            )


            toast.error(

                error
                    .response
                    ?.data
                    ?.message ||

                error.message ||

                'Something went wrong'
            )
        }
    }


    // =========================================
    // UI
    // =========================================

    return (

        <form
            onSubmit={onSubmitHandler}
            className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'
        >

            {/* =====================================
                LEFT SIDE
            ====================================== */}

            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>


                <div className='text-xl sm:text-2xl my-3'>

                    <Title
                        text1='DELIVERY'
                        text2='INFORMATION'
                    />

                </div>


                {/* FIRST NAME + LAST NAME */}

                <div className='flex gap-3'>

                    <input
                        required
                        onChange={onChangeHandler}
                        name='firstName'
                        value={formData.firstName}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type='text'
                        placeholder='First name'
                    />


                    <input
                        required
                        onChange={onChangeHandler}
                        name='lastName'
                        value={formData.lastName}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type='text'
                        placeholder='Last name'
                    />

                </div>


                {/* EMAIL */}

                <input
                    required
                    onChange={onChangeHandler}
                    name='email'
                    value={formData.email}
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    type='email'
                    placeholder='Email Address'
                />


                {/* STREET */}

                <input
                    required
                    onChange={onChangeHandler}
                    name='street'
                    value={formData.street}
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    type='text'
                    placeholder='Street'
                />


                {/* CITY + STATE */}

                <div className='flex gap-3'>

                    <input
                        required
                        onChange={onChangeHandler}
                        name='city'
                        value={formData.city}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type='text'
                        placeholder='City'
                    />


                    <input
                        required
                        onChange={onChangeHandler}
                        name='state'
                        value={formData.state}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type='text'
                        placeholder='State'
                    />

                </div>


                {/* ZIPCODE + COUNTRY */}

                <div className='flex gap-3'>

                    <input
                        required
                        onChange={onChangeHandler}
                        name='zipcode'
                        value={formData.zipcode}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type='number'
                        placeholder='Zipcode'
                    />


                    <input
                        required
                        onChange={onChangeHandler}
                        name='country'
                        value={formData.country}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        type='text'
                        placeholder='Country'
                    />

                </div>


                {/* PHONE */}

                <input
                    required
                    onChange={onChangeHandler}
                    name='phone'
                    value={formData.phone}
                    className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    type='number'
                    placeholder='Phone'
                />

            </div>


            {/* =====================================
                RIGHT SIDE
            ====================================== */}

            <div className='mt-8'>


                {/* CART TOTAL */}

                <div className='mt-8 min-w-80'>

                    <CartTotal />

                </div>


                {/* PAYMENT METHOD */}

                <div className='mt-12'>


                    <Title
                        text1='PAYMENT'
                        text2='METHOD'
                    />


                    <div className='flex gap-3 flex-col lg:flex-row'>


                        {/* =================================
                            STRIPE
                        ================================== */}

                        <div
                            onClick={() =>
                                setMethod('stripe')
                            }
                            className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
                        >

                            <p
                                className={`min-w-3.5 h-3.5 border rounded-full ${
                                    method === 'stripe'
                                        ? 'bg-green-400'
                                        : ''
                                }`}
                            >
                            </p>


                            <img
                                src={assets.stripe_logo}
                                className='h-5 mx-4'
                                alt='Stripe'
                            />

                        </div>


                        {/* =================================
                            RAZORPAY
                        ================================== */}

                        <div
                            onClick={() =>
                                setMethod('razorpay')
                            }
                            className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
                        >

                            <p
                                className={`min-w-3.5 h-3.5 border rounded-full ${
                                    method === 'razorpay'
                                        ? 'bg-green-400'
                                        : ''
                                }`}
                            >
                            </p>


                            <img
                                src={assets.razorpay_logo}
                                className='h-5 mx-4'
                                alt='Razorpay'
                            />

                        </div>


                        {/* =================================
                            CASH ON DELIVERY
                        ================================== */}

                        <div
                            onClick={() =>
                                setMethod('cod')
                            }
                            className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
                        >

                            <p
                                className={`min-w-3.5 h-3.5 border rounded-full ${
                                    method === 'cod'
                                        ? 'bg-green-400'
                                        : ''
                                }`}
                            >
                            </p>


                            <p className='text-gray-500 font-medium text-sm mx-4'>

                                CASH ON DELIVERY

                            </p>

                        </div>

                    </div>


                    {/* =================================
                        PLACE ORDER BUTTON
                    ================================== */}

                    <div className='w-full text-end mt-8'>

                        <button
                            type='submit'
                            className='bg-black text-white px-16 py-3 text-sm'
                        >

                            PLACE ORDER

                        </button>

                    </div>

                </div>

            </div>

        </form>
    )
}


export default PlaceOrder