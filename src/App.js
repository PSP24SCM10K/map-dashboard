import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { states } from './asset/states.js';
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
  const [selectedState, setSelectedState] = useState(''); 

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('move', () => {
      setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.current.getZoom().toFixed(2)));
    });

    map.current.on('load', () => {
      const statesGeoJSON = {
        type: 'FeatureCollection',
        features: states.map(state => ({
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
    });
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
      map.current.setLayoutProperty('states-fill', 'visibility', 'visible');
      map.current.setLayoutProperty('states-border', 'visibility', 'visible');
  
     
      if (selectedId) {
        map.current.setLayoutProperty('states-fill', 'visibility', 'none');
        map.current.setLayoutProperty('states-border', 'visibility', 'none');
  
       
        map.current.setPaintProperty(
          'states-fill',
          'fill-opacity',
          ['match', ['get', 'id'], selectedId, 0.8, 0]
        );
        map.current.setPaintProperty(
          'states-border',
          'line-opacity',
          ['match', ['get', 'id'], selectedId, 1, 0]
        );
      }
    }
  };
  

  return (
    <div>
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
            {}
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
