const express = require('express')
const app = express()

app.use(express.json())

markers = [
    {
        id: 0,
        latlng: [16, 28],
        title: 'Paikka 1',
        description: 'Tietoa paikasta 1'
    },
    {
        id: 1,
        latlng: [26, 28],
        title: 'Paikka 2',
        description: 'Tietoa paikasta 2'
    },
    {
        id: 2,
        latlng: [36, 28],
        title: 'Paikka 3',
        description: 'Tietoa paikasta 3'
    },
]

app.get('/', (request, response) => {
    response.send('<h1>nothing</h1>')
})

app.get('/api/markers', (request, response) => {
    response.json(markers)
})

app.post('/api/markers', (request, response) => {
    const marker = request.body
    console.log(marker)
    response.json(marker)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})