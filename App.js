// import React from 'react';
// import MapView , {PROVIDER_GOOGLE} from 'react-native-maps';
// import { StyleSheet, View } from 'react-native';


// export default function App() {
//   return (
//     <View style={styles.container}>
//       <MapView style={styles.map} provider={PROVIDER_GOOGLE}/>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
// });

import React, { useState, useRef } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { 
   StyleSheet,
   Text,
   View,
   Dimensions,
   TouchableOpacity,
   } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapViewDirections from 'react-native-maps-directions';


type InputAutocompleteProps = {
  label: String,
  placeholder?: String,
  onPlaceSelected: (details: GooglePlaceDetail | null) => void,
};
function InputAutocomplete({
  label,
  placeholder,
  onPlaceSelected,
}: InputAutocompleteProps) {
  return (
    <>
      <Text>{label}</Text>
      <GooglePlacesAutocomplete
        styles={{ textInput: styles.input }}
        placeholder={placeholder || ""}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
          // 'details' is provided when fetchDetails = true
          console.log(details.vicinity);
        }}
        query={{
          key:process.env.REACT_APP_GOOGLE_MAP_API,
          language: "en",
        }}
      />
    </>
  );
}

export default function Home({navigation}) {
  // set locations values and direction
  const [origin, setOrigin] = useState({ 
    latitude: null, 
    longitude: null });
  const [destination, setDestination] = useState({
    latitude: null,
    longitude: null,
  });
  const [showDirections,setShowDirections] = useState(false);
  const [distance,setDistance] = useState(0);
  const [duration,setDuration] = useState(0);
  const [show,setShow] = useState(false);
  const [pick,setPick] = useState({ 
    vicinity: null
  });
  const [drop,setDrop] = useState({ 
    vicinity: null
  });

  const mapRef = useRef({ MapView: null });
// set position with map marker
  const moveTo = async (position: LatLng) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };


  const edgePaddingValue = 70;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };
//Trace route read
  const traceRouteOnReady = (args: any) => {
    if(args){
        setDistance(args.distance)
        setDuration(args.duration)
    }
  }


  const traceRoute = () => {
    if(origin && destination){
      setShowDirections(true)
      mapRef.current?.fitToCoordinates([origin, destination], {edgePadding});
     

    }
  }
  // get details from the google api
  const onPlaceSelected = (
    details: GooglePlaceDetail | null,
    flag: "origin" | "destination"
  ) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const setLoc = flag === "origin" ? setPick : setDrop;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    const positionloc = {
      vicinity: details?.vicinity || null,
    };
    set(position);
    setLoc(positionloc);
    moveTo(position);
    console.log(pick.vicinity)

  };
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        initialRegion={{
          latitude: 6.850328,
          longitude: 79.922721,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
       {origin.latitude && origin.longitude && (
          <Marker coordinate={origin} />
        )}
        {destination.latitude && destination.longitude && (
          <Marker coordinate={destination} />
        )}
       {showDirections && origin && destination && <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={process.env.REACT_APP_GOOGLE_MAP_API}
          strokeColor = "#6644ff"
          strokeWidth ={4}
          onReady ={traceRouteOnReady}
        />} 
    
      </MapView>

      <View style={styles.searchContainer}>
        <InputAutocomplete
          label="Pick Up"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "origin");
          }}
        />
        <InputAutocomplete
          label="Destination"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        />
        <TouchableOpacity
         style={styles.button} 
          onPress={() =>{
            traceRoute();
            setShow(true);
            }}
          >
          <Text style= {styles.buttonText}>Trace Route</Text>
        </TouchableOpacity>
        <View style={styles.statsarea}>
          <Text style={styles.statsareaText}>Distance: {distance.toFixed(2)} Km</Text>
          <Text style={styles.statsareaText}>Duration: {Math.ceil(duration)} min</Text>
          { show? ( <TouchableOpacity
                    style={styles.buttonshow} 
                    // onPress = { () => navigation.navigate("BusPick",{
                    //   distance: distance,
                    //   pick: pick,
                    //   drop:drop,

                    // })}
                      >
                      <Text style= {styles.buttonText}>Make Trip</Text>
                    </TouchableOpacity>) : null
         }
        </View>
      
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
  },
  input: {
    borderColor: "#888",
    borderWidth: 1,
  },
  button:{
    backgroundColor: "#260B8C",
    paddingVertical: 20, 
    marginTop: 16,
    borderRadius: 24,
    marginHorizontal:60,
  },
  buttonText:{
    textAlign: 'center',
    color: 'white',
    fontSize:15,
    fontWeight:"bold"

  },
  statsarea:{
    marginTop:20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsareaText:{
    fontSize:18,
  },
  buttonshow:{
    marginTop:20,
    backgroundColor: "#260B8C",
    paddingVertical: 20, 
    borderRadius: 24,
    paddingHorizontal:20,
  }
});

