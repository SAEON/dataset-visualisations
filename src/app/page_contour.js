'use client';

import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {DeckGL} from '@deck.gl/react';
import {ContourLayer} from '@deck.gl/aggregation-layers';
import {GeoJsonLayer} from '@deck.gl/layers'; // GeoJsonLayer import
import {Map} from 'react-map-gl/maplibre';
import Slider from '@mui/material/Slider';
import {Box, Container} from '@mui/system';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress'; // For loading indicator

// --- Configuration Constants ---
const HARDCODED_TIME = "2025-06-21 03:30:30"; // Time string for FastAPI query
const API_BASE_URL = "http://localhost:8000"; // Base URL for your FastAPI
const INITIAL_VIEW_STATE = {
    longitude: 17.245, // Center longitude for the region
    latitude: -32.62,  // Center latitude for the region
    zoom: 6,
    pitch: 0,
    bearing: 0
};

// Depth levels for the slider (values in meters, positive for depth below surface)
const depths = [0, -5, -10, -50, -100, -500, -1000]; // Sorted from shallow to deep

// Marks for the depth slider (value corresponds to index in 'depths' array)
const depthMarks = depths.map((d, index) => ({
    value: index,
    label: d.toString()
}));

// Function to get depth value from slider index
function getDepthValueFromIndex(index) {
    return depths[index];
}

// Define temperature thresholds and corresponding colors for the ContourLayer
// These colors match the logic previously in getFillColor for MVTLayer
const TEMPERATURE_THRESHOLDS = [
    10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 14.5
];
const TEMPERATURE_COLORS = [
    [0, 0, 150, 200],   // < 10.0
    [0, 50, 200, 200],  // 10.0 to < 10.5
    [0, 100, 255, 200], // 10.5 to < 11.0
    [0, 150, 200, 200], // 11.0 to < 11.5
    [0, 200, 100, 200], // 11.5 to < 12.0
    [100, 200, 0, 200], // 12.0 to < 12.5
    [255, 255, 0, 200], // 12.5 to < 13.0
    [255, 165, 0, 200], // 13.0 to < 13.5
    [255, 100, 0, 200], // 13.5 to < 14.0
    [255, 50, 0, 200],  // 14.0 to < 14.5
    [200, 0, 0, 200]    // >= 14.5 (last color covers everything above the last threshold)
];

// Color for the coastline mask layer.
// This should closely match the land color of the CartoDB Positron map style.
// A common light beige/grey for land in Positron is around [242, 242, 242, 255] or [230, 230, 230, 255].
// Adjust this color if it doesn't perfectly blend with your map's land.
const COASTLINE_FILL_COLOR = [242, 242, 242, 255]; // Example: light grey/beige


export default function OceanViewer() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    // State to hold the selected depth (index of depths array initially)
    const [selectedDepthIndex, setSelectedDepthIndex] = useState(0); // Default to shallowest depth (0 meters)
    const currentDepth = useMemo(() => getDepthValueFromIndex(selectedDepthIndex), [selectedDepthIndex]);

    const [oceanData, setOceanData] = useState([]);
    const [coastlineData, setCoastlineData] = useState(null); // State for coastline GeoJSON
    const [loading, setLoading] = useState(false);
    const [loadingCoastline, setLoadingCoastline] = useState(false); // Loading state for coastline
    const [error, setError] = useState(null);

    // Memoize the API URL to trigger data fetch only when depth changes
    const apiUrl = useMemo(() =>
            `${API_BASE_URL}/data/${encodeURIComponent(HARDCODED_TIME)}/${currentDepth}`
        , [currentDepth]);

    // Effect hook to fetch data when the API URL changes (i.e., when depth changes)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            setOceanData([]); // Clear previous data
            try {
                console.log(apiUrl);
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    // Check for 404 specifically
                    if (response.status === 404) {
                        throw new Error(`No data available for the selected time and depth: ${response.statusText}`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data)
                setOceanData(data);
            } catch (e) {
                console.error("Failed to fetch ocean data:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]); // Re-run effect when apiUrl changes

    // Effect hook to fetch coastline GeoJSON data (runs once on component mount)
    // This is the added block for coastline data fetching
    useEffect(() => {
        const fetchCoastline = async () => {
            setLoadingCoastline(true);
            try {
                // Assuming coastline.geojson is in your public folder
                // If you have a URL, replace '/coastline.geojson' with your URL
                const response = await fetch('/za.json');
                if (!response.ok) {
                    throw new Error(`Failed to load coastline data: ${response.statusText}`);
                }
                const data = await response.json();
                setCoastlineData(data);
            } catch (e) {
                console.error("Failed to fetch coastline data:", e);
                // Don't set a global error for coastline, as map can still render without it
            } finally {
                setLoadingCoastline(false);
            }
        };

        fetchCoastline();
    }, []); // Empty dependency array means this runs once on mount


    // Define the Deck.gl layers
    const layers = [
        new ContourLayer({
            id: 'temperature-contour-layer',
            data: oceanData, // Data from FastAPI
            getPosition: d => [d.longitude, d.latitude], // Access longitude and latitude
            getWeight: d => d.temperature,
            cellSize: 4000, // Adjust based on your data density and desired resolution (in meters)
            aggregation: 'MAX', // Aggregate values within cells
            contours: [
                {threshold: [0, 10], color: [0, 0, 150, 200], zIndex: 1},
                {threshold: [10, 11], color: [0, 50, 200, 200], zIndex: 1},
                {threshold: [11, 12], color: [0, 100, 255, 200], zIndex: 1},
                {threshold: [12, 13], color: [0, 150, 200, 200], zIndex: 1},
                {threshold: [13, 14], color: [0, 200, 100, 200], zIndex: 1},
                {threshold: [14, 15], color: [100, 200, 0, 200], zIndex: 1},
                {threshold: [15, 16], color: [255, 255, 0, 200], zIndex: 1},
                {threshold: [16, 17], color: [255, 165, 0, 200], zIndex: 1},
                {threshold: [17, 18], color: [255, 100, 0, 200], zIndex: 1},
                {threshold: [18, 19], color: [255, 50, 0, 200], zIndex: 1},
            ],
            pickable: true,
            visible: oceanData.length > 0 && !loading, // Only show layer if data is loaded and not loading
        }),
        // GeoJsonLayer for the coastline mask - This is the added layer
        new GeoJsonLayer({
            id: 'coastline-mask-layer',
            data: coastlineData,
            stroked: false,
            filled: true,
            getFillColor: COASTLINE_FILL_COLOR, // Use the defined land color
            // Ensure this layer is rendered AFTER the ContourLayer to overlay it
            // DeckGL renders layers in the order they appear in the array.
            pickable: false, // Not interactive
            visible: true, // Always visible if data is loaded
        }),
    ].filter(Boolean); // Filter out null/undefined layers if coastlineData is not yet loaded

    return (
        <div style={{position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden'}}>
            {/* Loading Indicator */}
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        p: 4,
                        borderRadius: 2,
                        color: 'white'
                    }}
                >
                    <CircularProgress color="inherit"/>
                    <Typography variant="h6" sx={{mt: 2}}>Loading Ocean Data...</Typography>
                </Box>
            )}

            {/* Error Message */}
            {error && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        bgcolor: 'error.dark',
                        color: 'white',
                        p: 2,
                        borderRadius: 1,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body1">{error}</Typography>
                </Box>
            )}

            <DeckGL
                layers={layers}
                initialViewState={viewState}
                onViewStateChange={e => setViewState(e.viewState)}
                controller={true}
            >
                <Map
                    mapStyle="https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json"
                />
            </DeckGL>

            {/* Depth Slider */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 20,
                    width: 'max-content',
                    height: 'max-content',
                    py: 1,
                    borderRadius: 1,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgb(0, 30, 60)',
                    color: 'white',
                    zIndex: 10, // Ensure slider is above the map
                }}
            >
                <Container sx={{
                    mx: 'auto',
                    mb: 2
                }}>
                    <Typography id="depth-slider" gutterBottom>
                        Depth (m)
                    </Typography>
                </Container>
                <Slider
                    size="small"
                    aria-label="Depth"
                    defaultValue={selectedDepthIndex} // Set default to the index of 0m depth
                    step={null} // Use marks for steps
                    valueLabelDisplay="off"
                    orientation="vertical"
                    marks={depthMarks}
                    min={0}
                    max={depths.length - 1} // Max value is the last index of the depths array
                    scale={getDepthValueFromIndex} // Use scale to display actual depth values
                    onChange={(event, newValue) => setSelectedDepthIndex(newValue)}
                    track={false}
                    sx={{
                        '& .MuiSlider-markLabel': {
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                        },
                        height: '80vh',
                        px: 2, // Add some horizontal padding for marks
                    }}
                />
            </Box>
        </div>
    );
}
