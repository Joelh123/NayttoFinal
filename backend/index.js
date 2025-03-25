const express = require('express')
const app = express()
require('dotenv').config()

const Marker = require('./models/marker')
const User = require('./models/user')

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

app.get('/api/users', (request, response, next) => {
    User.find({})
        .then(users => {
        response.json(users)
        })
        .catch(error => next(error))
})

app.get('/api/users/:id', (request, response, next) => {
    User.findById(request.params.id)
        .then(user => {
            if (user) {
                response.json(user)
            } else {
                console.log('failed')
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/users', (request, response, next) => {
    const body = request.body

    if (body.name === undefined || body.password === undefined || body.visited === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const userObject = new User({
        name: body.name,
        password: body.password,
        visited: body.visited
    })

    userObject.save()
        .then(savedUser => {
        response.json(savedUser)
        })
        .catch(error => next(error))
})

app.put('/api/users/:id', (request, response, next) => {
    const { name, password, visited } = request.body

    User.findByIdAndUpdate(request.params.id, { name, password, visited }, { new: true, runValidators: true, context: 'query' })
        .then(updatedUser => {
            response.json(updatedUser)
        })
        .catch(error => next(error))
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})