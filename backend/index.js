const express = require('express')
const app = express()
require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const MarkerPreset = require('./models/markerpreset')
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

app.post('/api/marker_presets', (request, response, next) => {
    const body = request.body

    if (body.markers === undefined || body.creator === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const markerPresetObject = new MarkerPreset({
        creator: body.creator,
        markers: body.markers
    }) 

    markerPresetObject.save()
        .then(savedMarker => {
        response.json(savedMarker)
        })
        .catch(error => next(error))
})

app.get('/api/marker_presets', (request, response, next) => {
    MarkerPreset.find({})
        .then(markerpresets => {
            response.json(markerpresets)
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

app.post('/api/users', async (request, response) => {
    const { name, password, visited } = request.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        name,
        passwordHash,
        visited
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

app.post('/api/users', async (request, response, next) => {
    const { name, password, visited } = request.body

    if (name === undefined || password === undefined || visited === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    const user = await User.findOne({ name })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        name: user.name,
        id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    response
        .status(200)
        .send({ token, name: user.name, visited: user.visited })
})

app.put('/api/users/:id', (request, response, next) => {
    const body = request.body

    const user = {
        name: body.name,
        visited: body.visited,
        id: body.id
    }
    
    User.findByIdAndUpdate(request.params.id, user, { new: true })
        .then(updatedUser => {
            response.json(updatedUser)
        })
        .catch(error => next(error))
})

app.post('/api/login', async (request, response) => {
    const { name, password } = request.body
  
    const user = await User.findOne({ name })
    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash)
  
    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: 'invalid username or password'
      })
    }
  
    const userForToken = {
      name: user.name,
      id: user._id,
    }
    
    const token = jwt.sign(
      userForToken, 
      process.env.SECRET,
      { expiresIn: 60*60 }
    )
  
    response
      .status(200)
      .send({ token, name: user.name, visited: user.visited, id: user.id })
  })

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})