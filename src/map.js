import React, { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import Geocoder from "react-mapbox-gl-geocoder";
import { Container, Col, Row, Button, Input } from "reactstrap";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";

const mapStyle = {
  width: "100%",
  height: 600,
};

const mapboxApiKey =
  "pk.eyJ1IjoibGF5dGgxMjM0IiwiYSI6ImNsbHdqYXl6NDBicTUzaW81OHF1NTBxcGsifQ.rLMy7EOGUT445OhEHd5ItA";

const params = {
  country: "ca",
};

const CustomMarker = ({ index, marker, openPopup }) => {
  return (
    <Marker longitude={marker.longitude} latitude={marker.latitude}>
      <div className="marker" onClick={() => openPopup(index)}>
        <span>
          <b>{index + 1}</b>
        </span>
      </div>
    </Marker>
  );
};

const CustomPopup = ({ index, marker, closePopup }) => {
  return (
    <Popup
      latitude={marker.latitude}
      longitude={marker.longitude}
      onClose={closePopup}
      closeButton={true}
      closeOnClick={false}
      offsetTop={-30}
    >
      <p>{marker.rescue_org}</p>
      <p>{marker.place_name}</p>
    </Popup>
  );
};

const MapView = () => {
  const [selectedObject, setSelectedObject] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadedObjects, setUploadedObjects] = useState([]);

  useEffect(() => {
    // Fetch uploaded objects from the server and update the state
    // You would need to implement this fetch function
    fetchUploadedObjects();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bimFile", file);

    try {
      await axios.post("http://localhost:3001/upload", formData);
      alert("File uploaded successfully.");
      // Fetch updated uploaded objects and update the state
      fetchUploadedObjects();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }
  };

  const fetchUploadedObjects = async () => {
    try {
      const response = await axios.get("http://localhost:3001/objects");

      console.log("@@@@@@@@@@@", response.data);
      setUploadedObjects(response.data);
      response.data.forEach((data) => {
        console.log(data);
        let locationData = {
          id: data.id,
          index: data.id,
          place_name: data.filename,
          latitude: data.latitude,
          longitude: data.longitude,
        };

        console.log(locationData);
        addLocation(locationData);
      });
    } catch (error) {
      console.error("Error fetching uploaded objects:", error);
    }
  };

  const [viewport, setViewport] = useState({
    latitude: 53.933,
    longitude: -116.5765,
    zoom: 3.5,
  });
  const [tempMarker, setTempMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const addLocation = (locationData) => {
    setMarkers((prevMarkers) => [...prevMarkers, locationData]);
  };

  const onSelected = (viewport, item) => {
    setViewport(viewport);
    setTempMarker({
      name: item.place_name,
      longitude: item.center[0],
      latitude: item.center[1],
    });
  };

  const add = () => {
    setMarkers((prevMarkers) => [...prevMarkers, tempMarker]);
    setTempMarker(null);
  };

  const setSelectedMarker = (index) => {
    setSelectedIndex(index);
  };

  const closePopup = () => {
    setSelectedMarker(null);
  };

  const openPopup = (index) => {
    setSelectedMarker(index);
  };

  return (
    <Container fluid={true}>
      <Row>
        <Col>
          <h2>BIM Object Portal</h2>
        </Col>
      </Row>
      <Row className="py-4">
        <Col>
          <div className="upload-section">
            <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <Button color="primary" onClick={handleFileUpload}>
              Upload
            </Button>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <ReactMapGL
            mapboxApiAccessToken={mapboxApiKey}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            {...viewport}
            {...mapStyle}
            onViewportChange={setViewport}
          >
            {tempMarker && (
              <Marker
                longitude={tempMarker.longitude}
                latitude={tempMarker.latitude}
              >
                <div className="marker temporary-marker">
                  <span></span>
                </div>
              </Marker>
            )}
            {markers.map((marker, index) => (
              <CustomMarker
                key={`marker-${index}`}
                index={index}
                marker={marker}
                openPopup={openPopup}
              />
            ))}
            {selectedIndex !== null && (
              <CustomPopup
                index={selectedIndex}
                marker={markers[selectedIndex]}
                closePopup={closePopup}
              />
            )}
          </ReactMapGL>
        </Col>
      </Row>
      <Row>
        <Col>
          {uploadedObjects.map((location) => (
            <Col key={location.id}>
              <p>
                location Name: <span>{location.filename}</span>
              </p>
              <p>
                Websites built: <span>{location.latitude}</span>
              </p>
              <p>
                location location: <span>{location.longitude}</span>
              </p>
            </Col>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default MapView;
