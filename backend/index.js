const express = require('express')
const app = express()
require('dotenv').config()

const Marker = require('./models/marker')

app.use(express.static('dist'))
const cors = require('cors')
app.use(cors())
app.use(express.json())

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
    response.send('<h1>nothing</h1>')
})

app.get('/api/markers', (request, response, next) => {
    Marker.find({})
        .then(markers => {
        response.json(markers)
        })
        .catch(error => next(error))
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

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})