import { useEffect, useRef, useState } from 'react'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'
import markerService from './service/markers'

const LoginPage = ({ loggedIn, setLoggedIn }) => {

  return (
    <div>
      <h1>Kirjaudu sisään</h1>
      <button onClick={() => setLoggedIn(true)}>Kirjaudu</button>
    </div>
  )
}

const MainApp = ({ position, markers, setPosition, loggedIn, setLoggedIn }) => {

  const mapRef = useRef(null);
  const latitude = 61.68784229131595
  const lnggitude = 27.273137634746142;

  return (
    <div>
      <button onClick={() => setLoggedIn(false)}>Poistu</button>
      <MapContainer center={[latitude, lnggitude]} zoom={17} ref={mapRef} style={{height: "98.2vh", width: "99.2vw"}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ShowMarkers position={position} markers={markers} />
        <LocationMarker map={mapRef} position={position} setPosition={setPosition} /> 
      </MapContainer>
    </div>
  )
}

const LocationMarker = ({ position, setPosition }) => {

  const map = useMapEvents({
    locationfound: (e) => {
      setPosition(e.latlng)
    },
  }) 
  
  useEffect(() => {
    const interval = setInterval(() => {
      map.locate()
    }, 10000)
  }, [map])

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Your current location</Popup>
    </Marker>
  )
}

const ShowMarkers = ({ position, markers }) => (
  markers.map(marker => <Marker key={marker.id} position={marker.latlng}><ShowPopup position={position} marker={marker}></ShowPopup></Marker>)
)

const ShowPopup = ({ position, marker }) => {
  let lat1 = position.lat
  let lng1 = position.lng
  let lat2 = marker.latlng[0]
  let lng2 = marker.latlng[1]

  let dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  let dlng = ((lng2 - lng1) * Math.PI) / 180.0;

  lat1 = (lat1 * Math.PI) / 180.0;
  lat2 = (lat2 * Math.PI) / 180.0;

  let a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dlng / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  let rad = 6371;
  let c = 2 * Math.asin(Math.sqrt(a));

  let distanceTo = ((rad * c) * 1000).toFixed(1) 

  console.log(distanceTo)

  return distanceTo > 40 ? null :(
    <Popup>
      {marker.description}
    </Popup>
  )
}

const App = () => {
  const [position, setPosition] = useState(null)
  const [markers, setMarkers] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)

  // useEffect(() => {
  //   markerService
  //     .getAll()
  //     .then(initialMarkers => {
  //       setMarkers(initialMarkers)
  //     })
  // }, [])

  const testMarkers = [
    {
      id: 0,
      latlng: [
        61.68701285124263,
        27.266642536228886
      ],
      title: "paikka 0",
      description: "tietoa paikasta 0"
    },
    {
      id: 1,
      latlng: [
        61.68778443915931,
        27.278801201368967
      ],
      title: "paikka 1",
      description: "tietoa paikasta 1"
    },
    {
      id: 2,
      latlng: [
        61.693714343527674,
        27.26734346512269
      ],
      title: "paikka 2",
      description: "tietoa paikasta 2"
    },
    {
      id: 3,
      latlng: [
        61.69041189975269,
        27.24149701054094
      ],
      title: "paikka 3",
      description: "tietoa paikasta 3"
    }
  ]

  useEffect(() => {
    setMarkers(testMarkers)
    setPosition({
        lat: 61.68693663746489,
        lng: 27.26595425759984
      })
  }, [])
  if (!loggedIn) {
    return (
      <LoginPage loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
    )
  } else {
    return (
      <MainApp position={position} markers={markers} setPosition={setPosition} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
    )
  }
}

export default App