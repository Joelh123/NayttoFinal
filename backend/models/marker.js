require('dotenv').config()
const mongoose = require("mongoose");

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB', error.message)
    })

const markerSchema = new mongoose.Schema({
    latlng: {
        type: Array,
        minLength: 2,
        maxLength: 2,
        required: true
    },
    title: String,
    description: String
})

markerSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Marker', markerSchema)