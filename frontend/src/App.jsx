import { useEffect, useRef, useState } from 'react'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'
import markerPresetService from './service/markerpresets'
import userService from './service/users'

const LogInPage = ({ setLoggedIn, users, setCurrentUser, markerPresets, setMarkers }) => {
  const handleLogIn = e => {
    e.preventDefault();
    console.log(e.target.accountName.value)

    for (const user of users) {
      if (!e.target.accountName.value) {
        alert('lisää s-posti')
        return
      } else if (!e.target.password.value) {
        alert('lisää salasana')
        return
      } else if (e.target.accountName.value == user.name && e.target.password.value == user.password) {
        setCurrentUser(user)
        console.log(user)
        for (const markerPreset of markerPresets) {
          if (user.name === markerPreset.creator) {
            setMarkers(markerPreset.markers)
          }
        }

        setLoggedIn(true)
        return
      }
    }

    alert('väärä salasana ja käyttäjätunnus yhdistelmä')
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
    </div>
  )
}

const MainApp = ({ position, markers, setPosition, setLoggedIn, currentUser }) => {

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
        <LocationMarker map={mapRef} position={position} setPosition={setPosition} />
        <ShowMarkers position={position} markers={markers} currentUser={currentUser} />
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

  // const testMarkers = [
  //   {
  //     id: 0,
  //     latlng: [
  //       61.68701285124263,
  //       27.266642536228886
  //     ],
  //     title: "paikka 0",
  //     description: "tietoa paikasta 0"
  //   },
  //   {
  //     id: 1,
  //     latlng: [
  //       61.68778443915931,
  //       27.278801201368967
  //     ],
  //     title: "paikka 1",
  //     description: "tietoa paikasta 1"
  //   },
  //   {
  //     id: 2,
  //     latlng: [
  //       61.693714343527674,
  //       27.26734346512269
  //     ],
  //     title: "paikka 2",
  //     description: "tietoa paikasta 2"
  //   },
  //   {
  //     id: 3,
  //     latlng: [
  //       61.695609993787365,
  //       27.26321017775972
  //     ],
  //     title: "paikka 3",
  //     description: "tietoa paikasta 3"
  //   }
  // ]

  // const users = [
  //   {
  //     id: 0,
  //     name: 'Joel',
  //     password: '123',
  //     visited: []
  //   },
  //   {
  //     id: 1,
  //     name: 'Eetu',
  //     password: '321',
  //     visited: []
  //   }
  // ]

  // useEffect(() => {
  //   setMarkers(testMarkers)
  //   setPosition({
  //       lat: 61.68693663746489,
  //       lng: 27.26595425759984
  //     })
  // }, [])

  if (!loggedIn) {
    return (
      <LogInPage setLoggedIn={setLoggedIn} users={users} setCurrentUser={setCurrentUser} markerPresets={markerPresets} setMarkers={setMarkers} />
    )
  } else {
    return (
      <MainApp position={position} markers={markers} setPosition={setPosition} loggedIn={loggedIn} setLoggedIn={setLoggedIn} currentUser={currentUser} />
    )
  }
}

export default App