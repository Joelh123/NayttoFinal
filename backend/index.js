const express = require('express')
const app = express()
require('dotenv').config()

const Marker = require('./models/marker')

app.use(express.static('dist'))
const cors = require('cors')
app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
    response.send('<h1>nothing</h1>')
})

app.get('/api/markers', (request, response) => {
    Marker.find({}).then(markers => {
        response.json(markers)
    })
})

app.post('/api/markers', (request, response, next) => {
    const body = request.body

    if (body.description === undefined || body.title === undefined || body.latlng === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const markerObject = new Marker({
        latlng: body.latlng,
        title: body.title,
        description: body.description
    })

    markerObject.save()
        .then(savedMarker => {
        response.json(savedMarker)
        })
        .catch(error => next(error))
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})