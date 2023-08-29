import React, { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { ListGroup, ListGroupItem } from "reactstrap";
import { Container, Col, Row, Button, Input } from "reactstrap";
import toastr from "toastr";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import "./map.css";
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
  const [uploadedObjects, setUploadedObjects] = useState([]);

  useEffect(() => {
    // Fetch uploaded objects from the server and update the state
    fetchUploadedObjects();
  }, []);

  const [jsonData, setJsonData] = useState(null);

  // Function to handle file input change
  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const fileContent = await readFile(file);
        const parsedData = JSON.parse(fileContent);
        setJsonData(parsedData);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (e) => {
        reject(new Error("Error reading the file"));
      };
      reader.readAsText(file);
    });
  };

  // Function to send JSON data to the backend
  const handleSendToBackend = async () => {
    try {
      await axios
        .post("http://localhost:3001/create", { data: jsonData })
      toastr.success();
      fetchUploadedObjects();
    } catch (error) {
      toastr.error();
      console.error(error);
    }
  };

  const fetchUploadedObjects = async () => {
    setMarkers([]);
    try {
      const response = await axios.get("http://localhost:3001/read");
      response.data.forEach((data) => {
        let locationData = {
          id: data.id,
          index: data.id,
          place_name: data.filename,
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setMarkers((prevMarkers) => [...prevMarkers, locationData]);
      });
      setUploadedObjects(response.data);
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
            <Input
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
            />
            <Button
              className="button1"
              color="primary"
              onClick={handleSendToBackend}
            >
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
      <Container className="list">
        <Row>
          <Col>
            <Col>
              <h4>Uploaded Places List</h4>
            </Col>
            {uploadedObjects.map((location) => (
              <Col key={location.id}>
                <ListGroup>
                  <ListGroupItem>
                    location Name: {location.filename}
                  </ListGroupItem>
                  <ListGroupItem>latitude: {location.latitude}</ListGroupItem>
                  <ListGroupItem>longitude: {location.longitude}</ListGroupItem>
                </ListGroup>
              </Col>
            ))}
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default MapView;
