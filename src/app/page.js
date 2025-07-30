'use client';

import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {DeckGL} from '@deck.gl/react';
import {PolygonLayer} from '@deck.gl/layers'; // Only PolygonLayer import
import {Map} from 'react-map-gl/maplibre';
import Slider from '@mui/material/Slider';
import {Box, Container} from '@mui/system';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress'; // For loading indicator
import MockOceanData from '/test_data/2025_06_21_033030_50.json';

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

// Define temperature thresholds and corresponding colors for the PolygonLayer
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

// Function to determine fill color for a polygon based on its temperature
const getPolygonFillColor = (d) => {
    const temperature = d.temperature;
    for (let i = 0; i < TEMPERATURE_THRESHOLDS.length; i++) {
        if (temperature < TEMPERATURE_THRESHOLDS[i]) {
            return TEMPERATURE_COLORS[i];
        }
    }
    return TEMPERATURE_COLORS[TEMPERATURE_COLORS.length - 1];
};


export default function OceanViewer() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [selectedDepthIndex, setSelectedDepthIndex] = useState(3);
    const currentDepth = useMemo(() => getDepthValueFromIndex(selectedDepthIndex), [selectedDepthIndex]);

    const [oceanData, setOceanData] = useState([]);
    // Removed coastlineData state
    const [loadingOceanData, setLoadingOceanData] = useState(false);
    // Removed loadingCoastline state
    const [error, setError] = useState(null);

    // ---- Commented out so that data is fetched from test_data in below function ----
    // Memoize the API URL for ocean data
    // const oceanDataApiUrl = useMemo(() =>
    //         `${API_BASE_URL}/data/${encodeURIComponent(HARDCODED_TIME)}/${currentDepth}`
    //     , [currentDepth]);
    //
    // // Effect hook to fetch ocean data
    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoadingOceanData(true);
    //         setError(null);
    //         setOceanData([]);
    //         try {
    //             console.log(oceanDataApiUrl);
    //             const response = await fetch(oceanDataApiUrl);
    //             if (!response.ok) {
    //                 if (response.status === 404) {
    //                     throw new Error(`No data available for the selected time and depth: ${response.statusText}`);
    //                 }
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }
    //             const data = await response.json();
    //             console.log("Fetched ocean data:", data);
    //             setOceanData(data);
    //         } catch (e) {
    //             console.error("Failed to fetch ocean data:", e);
    //             setError(e.message);
    //         } finally {
    //             setLoadingOceanData(false);
    //         }
    //     };
    //
    //     fetchData();
    // }, [oceanDataApiUrl]);

    // ---- Fetch data from test data as opposed to using the URL ----
    useEffect(() => {
        const fetchData = async () => {
            setLoadingOceanData(true);
            setError(null);
            setOceanData([]);
            try {
                // Simulate an API call with a delay
                await new Promise(resolve => setTimeout(resolve, 500));

                console.log("Using local ocean data:", MockOceanData);
                setOceanData(MockOceanData);
            } catch (e) {
                console.error("Failed to load local data:", e);
                setError(e.message);
            } finally {
                setLoadingOceanData(false);
            }
        };

        fetchData();
    }, []);

    // Define the Deck.gl layers
    const layers = [
        // PolygonLayer for ocean model cells
        new PolygonLayer({
            id: 'ocean-model-polygon-layer',
            data: oceanData,
            getPolygon: d => JSON.parse(d.cell_points),
            getFillColor: getPolygonFillColor,
            stroked: false,
            filled: true,
            extruded: false,
            wireframe: false,
            pickable: true,
            autoHighlight: true,
            visible: oceanData.length > 0 && !loadingOceanData,
        }),
        // Removed GeoJsonLayer for the coastline mask
    ]; // No need for .filter(Boolean) as there's only one layer now

    return (
        <div style={{position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden'}}>
            {/* Loading Indicator */}
            {loadingOceanData && ( // Only check loadingOceanData
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
                    <Typography variant="h6" sx={{mt: 2}}>
                        Loading Ocean Data...
                    </Typography>
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
                    zIndex: 10,
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
                    defaultValue={selectedDepthIndex}
                    step={null}
                    valueLabelDisplay="off"
                    orientation="vertical"
                    marks={depthMarks}
                    min={0}
                    max={depths.length - 1}
                    scale={getDepthValueFromIndex}
                    onChange={(event, newValue) => setSelectedDepthIndex(newValue)}
                    track={false}
                    sx={{
                        '& .MuiSlider-markLabel': {
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                        },
                        height: '80vh',
                        px: 2,
                    }}
                />
            </Box>
        </div>
    );
}
