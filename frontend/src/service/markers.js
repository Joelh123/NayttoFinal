import axios from "axios"
const baseUrl = '/api/markers'

const getAllMarkers = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

export default { getAllMarkers }