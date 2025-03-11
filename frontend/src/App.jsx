import { useRef, useState } from 'react'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'



const LocationMarker = ({ position, setPosition }) => {

  const map = useMapEvents({
    locationfound: (e) => {
      setPosition(e.latlng)
    },
  }) 
  
  setInterval(() => {
    map.locate()
  }, 5000)

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Your current location</Popup>
    </Marker>
  )
}

const App = () => {
  const [position, setPosition] = useState(null)

  const mapRef = useRef(null);
  const latitude = 51.505;
  const longitude = -0.09;
  
  return (
    <MapContainer center={[latitude, longitude]} zoom={13} ref={mapRef} style={{height: "98.2vh", width: "99.2vw"}}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          L I dkkd
        </Popup>
      </Marker>
      <LocationMarker map={mapRef} position={position} setPosition={setPosition} />
    </MapContainer>
  )
}

export default App