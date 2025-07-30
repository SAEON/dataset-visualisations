'use client';

import React, {useState, useMemo} from 'react';
import {DeckGL} from '@deck.gl/react';
import {MVTLayer} from '@deck.gl/geo-layers';
import {Map} from 'react-map-gl/maplibre';
import Slider from '@mui/material/Slider';
import {Box, Container} from '@mui/system';
import Typography from '@mui/material/Typography';

const HARDCODED_TIME = "2025-06-21 03:30:30+00";
const actualDataBounds = [14.5, -36.09, 19.99, -29.15];

const getCenter = (bounds) => {
    return [
        (bounds[0] + bounds[2]) / 2,
        (bounds[1] + bounds[3]) / 2
    ];
};
const center = getCenter(actualDataBounds);

const getFillColor = (d) => {
    const temperature = d.properties.temperature;
    if (temperature < 10.0) return [0, 0, 150, 200];
    if (temperature < 10.5) return [0, 50, 200, 200];
    if (temperature < 11.0) return [0, 100, 255, 200];
    if (temperature < 11.5) return [0, 150, 200, 200];
    if (temperature < 12.0) return [0, 200, 100, 200];
    if (temperature < 12.5) return [100, 200, 0, 200];
    if (temperature < 13.0) return [255, 255, 0, 200];
    if (temperature < 13.5) return [255, 165, 0, 200];
    if (temperature < 14.0) return [255, 100, 0, 200];
    if (temperature < 14.5) return [255, 50, 0, 200];
    return [200, 0, 0, 200];
};

const depths = [-1000, -500, -100, -50, -10, -5, 0];

const depthMarks = [
    {value: 6, label: '0'},
    {value: 5, label: '5'},
    {value: 4, label: '10'},
    {value: 3, label: '50'},
    {value: 2, label: '100'},
    {value: 1, label: '500'},
    {value: 0, label: '1000'},
]

function getDepth(index) {
    return depths[index];
}

export default function OceanViewer() {
    const [viewState, setViewState] = useState({
        longitude: center[0],
        latitude: center[1],
        zoom: 6,
        pitch: 0,
        bearing: 0
    });

    const [depth, setDepth] = useState(-50);

    const martinTileUrl = useMemo(() =>
            `http://localhost:3000/get_croco_tiles/{z}/{x}/{y}?query_time=${encodeURIComponent(HARDCODED_TIME)}&depth=${depth}`
        , [depth]);

    const layers = [
        new MVTLayer({
            id: 'croco-mvt-layer',
            data: martinTileUrl,
            key: martinTileUrl,
            minZoom: 0,
            maxZoom: 15,
            getLineColor: [0, 0, 0, 0],
            getFillColor: getFillColor,
            getPointRadius: 100,
            pointRadiusMinPixels: 2,
            pointRadiusMaxPixels: 15,
            pickable: true,
            autoHighlight: true,
        }),
    ];

    return (
        <div style={{position: 'relative', width: '100vw', height: '100vh'}}>
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
                }}
            >
                <Container sx={{
                    mx: 'auto',
                    mb: 2
                }}>
                    <Typography id="slider" gutterBottom>
                        Depth
                    </Typography>
                </Container>
                <Slider
                    size="small"
                    aria-label="Depth"
                    defaultValue={5}
                    step={null}
                    valueLabelDisplay="off"
                    orientation="vertical"
                    marks={depthMarks}
                    min={0}
                    max={6}
                    scale={getDepth}
                    onChange={(event, newValue) => setDepth(getDepth(newValue))}
                    track={false}
                    sx={{
                        '& .MuiSlider-markLabel': {
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                        },
                        height: '80vh',
                    }}
                />
            </Box>
        </div>
    );
}