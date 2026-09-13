import React, { useEffect, useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'



const Verify = () => {

    const {
        navigate,
        token,
        setCartItems,
        backendUrl
    } = useContext(ShopContext)


    const [searchParams] = useSearchParams()


    const success = searchParams.get('success')

    const orderId = searchParams.get('orderId')


    const verifyPayment = async () => {

        try {

            // Wait for token
            if (!token) {
                return
            }


            // Make sure order ID exists
            if (!orderId) {

                toast.error('Order ID not found')

                navigate('/cart')

                return
            }


            console.log("===== VERIFY PAYMENT =====")
            console.log("SUCCESS:", success)
            console.log("ORDER ID:", orderId)


            const response = await axios.post(

                backendUrl + '/api/order/verify-stripe',

                {
                    success,
                    orderId
                },

                {
                    headers: {
                        token: token
                    }
                }

            )


            console.log(
                "VERIFY RESPONSE:",
                response.data
            )


            if (response.data.success) {

                // Clear cart
                setCartItems({})


                toast.success(
                    'Payment Successful'
                )


                // Go to orders
                navigate('/orders')

            } else {

                toast.error(
                    response.data.message ||
                    'Payment Failed'
                )

 
                navigate('/cart')
            }


        } catch (error) {

            console.log(
                "VERIFY PAYMENT ERROR:",
                error
            )


            toast.error(

                error.response?.data?.message ||
                error.message ||
                'Payment verification failed'

            )


            navigate('/cart')
        }
    }


    useEffect(() => {

        verifyPayment()

    }, [token])


    return (

        <div className='min-h-[60vh] flex items-center justify-center'>

            <div className='text-center'>

                <h2 className='text-xl font-medium'>
                    Verifying Payment...
                </h2>

                <p className='text-gray-500 mt-2'>
                    Please wait while we verify your payment.
                </p>

            </div>

        </div>
    )
}


export default Verify