import { useEffect, useRef, useState } from 'react'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'
import markerPresetService from './service/markerpresets'
import userService from './service/users'
import loginService from  './service/login'

const LogInPage = ({ setLoggedIn, users, setUsers, setCurrentUser, markerPresets, setMarkers }) => {
  const handleLogIn = async e => {
    e.preventDefault();

    try {
      const user = await loginService.login({
        name: e.target.accountName.value, password: e.target.password.value,
      })
  
      for (const markerPreset of markerPresets) {
        if (markerPreset.creator === user.name) {
          setMarkers(markerPreset.markers)
          break
        } else {
          setMarkers([])
        }
      }

      setCurrentUser(user)
      setLoggedIn(true)

    } catch (exception) {
      console.log(exception)
      alert('väärä salasana ja käyttäjätunnus yhdistelmä')
    }

  }

  const handleRegistration = e => {
    e.preventDefault()

    const userObject = {
      name: e.target.newAccountName.value,
      password: e.target.newAccountPassword.value,
      visited: []
    }

    const foundUser = users.find(user => user.name === e.target.newAccountName.value)

    if (!foundUser) {
      userService
        .create(userObject)
        .then(response => {
          setUsers(users.concat(response))
        })
        .catch(error => {
          console.log(error)
        })
      alert("rekisteröinti onnistui")
    } else {
      alert('käyttäjänimi on jo käytössä')
    }
  }

  return (
    <div>
      <h1>Kirjaudu sisään</h1>
      <form onSubmit={handleLogIn}>
        <div>
          <input type='text' name='accountName' placeholder='Käyttäjätunnus'/>
        </div>
        <div>
          <input type='password' name='password' placeholder='Salasana'  />
        </div>
        <button>Kirjaudu</button>
      </form>
      <form onSubmit={handleRegistration}>
        <div>
          <input type='text' name='newAccountName' placeholder='Käyttäjätunnus' />
        </div>
        <div>
          <input type='password' name='newAccountPassword' placeholder='Salasana' />
        </div>
        <button>Rekisteröidy</button>
      </form>
    </div>
  )
}

const MainApp = ({ position, markers, setPosition, setLoggedIn, currentUser }) => {

  const mapRef = useRef(null);
  const latitude = 61.68784229131595
  const longitude = 27.273137634746142;

  return (
    <div>
      <MapContainer center={[latitude, longitude]} zoom={17} ref={mapRef} style={{height: "98.2vh", width: "99.2vw"}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Buttons setLoggedIn={setLoggedIn} map={mapRef} position={position} />
        <LocationMarker map={mapRef} position={position} setPosition={setPosition} />
        <ShowMarkers position={position} markers={markers} currentUser={currentUser} />
      </MapContainer>
    </div>
  )
}

const Buttons = ({ setLoggedIn, position }) => {
  const quitButtonStyle = {
    position: "absolute",
    top: 11,
    right: 10,
    zIndex: 1001
  }

  const centerButtonStyle = {
    position: "absolute",
    top: 11,
    right: 70,
    zIndex: 1001
  }

  const map = useMap()

  return (
    <div>
      <button onClick={() => setLoggedIn(false)} style={quitButtonStyle}>Poistu</button>
      <button onClick={() => map.flyTo(!position ? [61.68784229131595, 27.273137634746142] : position)} style={centerButtonStyle}>Keskitä</button>
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
    }, 5000)
  }, [map])

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Your current location</Popup>
    </Marker>
  )
}

const ShowMarkers = ({ position, markers, currentUser }) => {
  let markerElements = [];

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    let visited = currentUser.visited.includes(marker.title);

    markerElements.push(
      <Marker key={marker.title} position={marker.latlng} opacity={visited ? 0.6 : 1}>
        <ShowPopup position={position} marker={marker} currentUser={currentUser} />
      </Marker>
    );
  }

  return <>{markerElements}</>;
};

const ShowPopup = ({ position, marker, currentUser }) => {
  if (!position || !marker || !currentUser) {
    return <></>;
  }

  const map = useMap()

  let distanceTo = map.distance([position.lat, position.lng], marker.latlng) 

  if (distanceTo < 40) {
    if (!currentUser.visited.includes(marker.title)) {
      currentUser.visited.push(marker.title)

      const userObject = {
        name: currentUser.name,
        password: currentUser.password,
        visited: currentUser.visited
      }

      userService
        .update(currentUser.id, userObject)
    }

    return(
      <Popup>
        {marker.description}
      </Popup>
    )
  } else {
    return null
  }
}

const App = () => {
  const [position, setPosition] = useState(null)
  const [markers, setMarkers] = useState([])
  const [markerPresets, setMarkerPresets] = useState([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    markerPresetService
      .getAll()
      .then(initialMarkers => {
        setMarkerPresets(initialMarkers)
      })
  }, [])

  useEffect(() => {
    userService
      .getAll()
      .then(initalUsers => {
        setUsers(initalUsers)
      })
  }, [])

  if (!loggedIn) {
    return (
      <LogInPage setLoggedIn={setLoggedIn} users={users} setUsers={setUsers} setCurrentUser={setCurrentUser} markerPresets={markerPresets} setMarkers={setMarkers} />
    )
  } else {
    return (
      <MainApp position={position} markers={markers} setPosition={setPosition} loggedIn={loggedIn} setLoggedIn={setLoggedIn} currentUser={currentUser} />
    )
  }
}

export default App