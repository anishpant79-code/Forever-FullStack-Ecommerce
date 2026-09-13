
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import dns from "dns";
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/useRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

dns.setDefaultResultOrder("ipv4first");

//App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()


//middlewares
app.use(cors())
app.use(express.json())

//api endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=>console.log('Server started on PORT : '+port))