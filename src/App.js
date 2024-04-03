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

      // Add the fill layer
      map.current.addLayer({
        id: 'states-fill',
        type: 'fill',
        source: 'states',
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': opacity
        }
      });

      // Add the border layer
      map.current.addLayer({
        id: 'states-border',
        type: 'line',
        source: 'states',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 1
        }
      });
    });
  }, [lng, lat, zoom, opacity]); 

  const handleOpacityChange = (event) => {
    const newOpacity = parseFloat(event.target.value);
    setOpacity(newOpacity);
    if (map.current && map.current.getLayer('states-fill')) {
      map.current.setPaintProperty('states-fill', 'fill-opacity', newOpacity);
      map.current.setPaintProperty('states-border', 'line-opacity', newOpacity);
    }
  };

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng}, Latitude: {lat}, Zoom: {zoom}
        <div>
          <label htmlFor="opacity-slider">Layer Opacity: </label>
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
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
