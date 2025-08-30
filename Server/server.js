const express = require("express")
const app = express()
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")


app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 8080
const MONGO_URI = process.env.MONGODB_CONNECTION

mongoose.connect(MONGO_URI)
.then(()=>{
    console.log("Database connected successfully")
    app.listen(PORT,()=>{
        console.log(`Server is running on the port ${PORT}`)
    })
})
.catch((error)=> console.log("Error in connecting to database",error.message) )