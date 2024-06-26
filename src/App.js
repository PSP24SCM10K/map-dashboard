import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicHJhamFrdGEyMDU1IiwiYSI6ImNsdHFneWFhYTAzYWwyamxjc2lkNjhidWsifQ.UAmOtcYqST3OynA28EWI1w';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-98.35);
  const [lat, setLat] = useState(39.82);
  const [zoom, setZoom] = useState(3.5);
  const [opacity, setOpacity] = useState(0.5);
  const [fillVisibility, setFillVisibility] = useState('visible');
  const popup = useRef(new mapboxgl.Popup({ closeButton: false }));
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState([]); // State to store fetched data
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        center: [lng, lat],
        zoom: zoom
      });
  
      map.current.on('move', () => {
        setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
        setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(map.current.getZoom().toFixed(2)));
      });
  
      map.current.on('load', () => {
        // Fetch states data from the server
        fetch('/states')
          .then(response => response.json())
          .then(data => {
            setStates(data);
            const statesGeoJSON = {
              type: 'FeatureCollection',
              features: data.map(state => ({
                type: 'Feature',
                properties: {
                  name: state.name,
                  id: state.id,
                  CENSUSAREA: state.CENSUSAREA
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: state.geometry
                }
              }))
            };
  
            map.current.addSource('states', { type: 'geojson', data: statesGeoJSON });
  
            // Fill layer
            map.current.addLayer({
              id: 'states-fill',
              type: 'fill',
              source: 'states',
              paint: {
                'fill-color': '#0080ff',
                'fill-opacity': opacity
              },
              layout: {
                'visibility': fillVisibility
              }
            });
  
            // Border layer
            map.current.addLayer({
              id: 'states-border',
              type: 'line',
              source: 'states',
              layout: {
                'visibility': fillVisibility
              },
              paint: {
                'line-color': '#000',
                'line-width': 1,
                'line-opacity': opacity
              }
            });
          })
          .catch(error => {
            console.error('Error fetching states data:', error);
          });
      });
  
      // Hover interaction
      map.current.on('mousemove', 'states-fill', (e) => {
        const stateName = e.features[0].properties.name;
        const stateArea = e.features[0].properties.CENSUSAREA;
        const stateID = e.features[0].properties.id;
        const coordinates = e.lngLat;

        map.current.getCanvas().style.cursor = 'pointer';

        popup.current.setLngLat(coordinates)
          .setHTML(`<h3>${stateName}</h3><p>Area: ${stateArea}</p><p>ID: ${stateID}</p>`)
          .addTo(map.current);
      });

      // Remove popup on mouse leave
      map.current.on('mouseleave', 'states-fill', () => {
        map.current.getCanvas().style.cursor = '';
        popup.current.remove();
      });
    }
  }, [lng, lat, zoom, opacity, fillVisibility]);
  

  const handleOpacityChange = (event) => {
    const newOpacity = parseFloat(event.target.value);
    setOpacity(newOpacity);
    if (map.current) {
      map.current.setPaintProperty('states-fill', 'fill-opacity', newOpacity);
      map.current.setPaintProperty('states-border', 'line-opacity', newOpacity);
    }
  };

  const handleFillVisibleChange = (event) => {
    const visibility = event.target.value === 'on' ? 'visible' : 'none';
    setFillVisibility(visibility);
    if (map.current) {
      map.current.setLayoutProperty('states-fill', 'visibility', visibility);
      map.current.setLayoutProperty('states-border', 'visibility', visibility);
    }
  };
  const handleStateSelectionChange = (event) => {
    const selectedId = event.target.value;
    setSelectedState(selectedId);
  
    if (map.current) {
      if (selectedId) {
        // Set opacity based on selection
        map.current.setPaintProperty(
          'states-fill',
          'fill-opacity',
          ['case',
            ['==', ['get', 'id'], selectedId], 0.8, // Selected state has higher opacity
            0 // Non-selected states are invisible
          ]
        );
        map.current.setPaintProperty(
          'states-border',
          'line-opacity',
          ['case',
            ['==', ['get', 'id'], selectedId], 1, // Selected state border is fully visible
            0.1 // Other states have faint border
          ]
        );
      } else {
        // Reset the opacity when no state is selected ('All States' option)
        map.current.setPaintProperty('states-fill', 'fill-opacity', opacity);
        map.current.setPaintProperty('states-border', 'line-opacity', opacity);
      }
    }
  };
  
  

  return (
    <div>
      <div className="left-corner-info">
        <p>Longitude: {lng.toFixed(4)}</p>
        <p>Latitude: {lat.toFixed(4)}</p>
        <p>Zoom: {zoom.toFixed(2)}</p>
      </div>
      <div className="map-container" ref={mapContainer} />
      <div className="top-right-controls">
        <div className="slider-container">
          <label htmlFor="opacity-slider">Layer Opacity:</label>
          <input
            id="opacity-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={handleOpacityChange}
          /> {opacity.toFixed(2)}
        </div>
        <div className="dropdown-container">
          <label htmlFor="fill-visible">Fill Visibility:</label>
          <select id="fill-visible" onChange={handleFillVisibleChange} value={fillVisibility === 'visible' ? 'on' : 'off'}>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </div>
        <div className="dropdown-container">
          <label htmlFor="state-selection">Select State:</label>
          <select id="state-selection" onChange={handleStateSelectionChange} value={selectedState}>
            <option value="">All States</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
