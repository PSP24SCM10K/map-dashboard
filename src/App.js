import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; 
import { states } from './asset/states.js';
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicHJhamFrdGEyMDU1IiwiYSI6ImNsdHFneWFhYTAzYWwyamxjc2lkNjhidWsifQ.UAmOtcYqST3OynA28EWI1w';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('move', () => {
      const { lng: newLng, lat: newLat } = map.current.getCenter();
      const newZoom = map.current.getZoom();
      setLng(newLng.toFixed(4));
      setLat(newLat.toFixed(4));
      setZoom(newZoom.toFixed(2));
    });

    map.current.on('load', () => {
      try {
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

        console.log(statesGeoJSON); // Log the constructed GeoJSON to inspect its structure

        map.current.addSource('states', { type: 'geojson', data: statesGeoJSON });
            
        map.current.addLayer({
          id: 'states',
          type: 'fill',
          source: 'states',
          layout: {},
          paint: {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.5
          }
        });

        map.current.addLayer({
          id: 'outline',
          type: 'line',
          source: 'states',
          layout: {},
          paint: {
            'line-color': '#000',
            'line-width': 2
          }
        });
      } catch (error) {
        console.error("Error adding layers:", error);
      }
    });

    return () => map.current.remove();

  }, [lng, lat, zoom]);

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng}, Latitude: {lat}, Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
