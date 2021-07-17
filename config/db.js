const mongoose = require('mongoose')
//mongo connection function
const connectDB = async () =>{
    try{
        //connection string from mongo atlas
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })

        console.log(`MongoDB connected: ${conn.connection.host}`)
    }catch(err){    
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB