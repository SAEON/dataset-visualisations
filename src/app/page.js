'use client';

import React, {useState, useMemo} from 'react';
import {DeckGL} from '@deck.gl/react';
import {MVTLayer} from '@deck.gl/geo-layers';
import {Map} from 'react-map-gl/maplibre';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import {useSearchParams} from 'next/navigation'

import {useDatasetData} from './dataset_metadata_fetcher';
import {center, depths, depthMarks, getFillColor, temperatureColors} from './map_utils';

// Main component for the Ocean Viewer
export default function OceanViewer() {
    const searchParams = useSearchParams()
    const dataset_id = searchParams.get('dataset_id');

    const {data, loading, error, timeMarks, times} = useDatasetData(dataset_id);

    console.log(times);

    const [viewState, setViewState] = useState({
        longitude: center[0],
        latitude: center[1],
        zoom: 6,
        pitch: 0,
        bearing: 0,
    });

    // Set initial depth to 0 from the hardcoded array
    const initialDepth = 0;
    const [depth, setDepth] = useState(initialDepth);
    const [time, setTime] = useState(null);

    // Memoize the temperature variable and its thresholds
    const temperatureThresholds = useMemo(() => {
        return data?.variables.find((v) => v.name === 'temperature')?.thresholds || [];
    }, [data]);

    // Set the initial time once data is loaded
    React.useEffect(() => {
        if (data && !time) {
            setTime(data.start_date);
        }
    }, [data, time]);

    // Memoized URL for the tile data
    const martinTileUrl = useMemo(
        () =>
            `http://localhost:3001/get_ocean_data_tile/{z}/{x}/{y}?dataset_id=${dataset_id}&date_time=${encodeURIComponent(
                time
            )}&depth=${depth}`,
        [depth, time, dataset_id]
    );

    const layers = [
        new MVTLayer({
            id: 'croco-mvt-layer',
            data: martinTileUrl,
            key: martinTileUrl,
            minZoom: 0,
            maxZoom: 15,
            getFillColor: (d) => getFillColor(d, depth, temperatureThresholds),
            autoHighlight: true,
            pickable: true,
        }),
    ];

    if (loading || !dataset_id) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#1a202c',
                    color: '#e2e8f0',
                }}
            >
                <Typography variant="body1">Loading dataset metadata...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: '#1a202c',
                    color: '#f87171',
                }}
            >
                <Typography variant="body1">Error fetching data: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{position: 'relative', width: '100vw', height: '100vh'}}>
            <DeckGL
                layers={layers}
                initialViewState={viewState}
                onViewStateChange={(e) => setViewState(e.viewState)}
                controller={true}
            >
                <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json"/>
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
                }}
            >
                <Box sx={{px: '20px', pb: '10px'}}>
                    <Typography id="depth-slider" gutterBottom={true}>
                        Depth
                    </Typography>
                </Box>
                <Slider
                    size="small"
                    aria-label="Depth"
                    value={depths.indexOf(depth)}
                    step={null}
                    valueLabelDisplay="off"
                    orientation="vertical"
                    marks={depthMarks}
                    min={0}
                    max={depths.length - 1}
                    scale={(index) => depths[index]}
                    onChange={(event, newValue) => setDepth(depths[newValue])}
                    track={false}
                    sx={{
                        '& .MuiSlider-markLabel': {
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            pb: '10px'
                        },
                        height: '80vh',
                    }}
                />
            </Box>

            {/* Time Slider */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    width: '60vw',
                    py: 1,
                    px: 3,
                    borderRadius: 1,
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgb(0, 30, 60)',
                    color: 'white',
                }}
            >
                <Grid container alignItems="center" spacing={2}>
                    <Grid>
                        <Typography id="time-slider" gutterBottom={false}>
                            Date - Time
                        </Typography>
                    </Grid>
                    <Grid size="grow">
                        <Slider
                            size="small"
                            aria-label="Time"
                            value={times.indexOf(time)}
                            step={null}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => {
                                return new Date(value).toLocaleString();
                            }}
                            marks={timeMarks}
                            min={0}
                            max={times.length - 1}
                            scale={(index) => times[index]}
                            onChange={(event, newValue) => setTime(times[newValue])}
                            track={false}
                            sx={{
                                '& .MuiSlider-markLabel': {
                                    display: 'none',
                                },
                                marginBottom: '0',
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Card
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    borderRadius: 2,
                    boxShadow: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(8px)',
                    color: 'black',
                    p: 2,
                }}
            >
                <CardHeader title="Current Parameters" sx={{p: 0, pb: 1}}/>
                <CardContent sx={{p: 0}}>
                    <Typography variant="body2" sx={{mb: 1}} component="div">
                        <Box component="span" sx={{fontWeight: 'bold'}}>
                            Dataset ID:
                        </Box>{' '}
                        <Chip
                            label={dataset_id}
                            size="small"
                            variant="outlined"
                            sx={{fontFamily: 'monospace'}}
                        />
                    </Typography>
                    <Typography variant="body2" sx={{mb: 1}} component="div">
                        <Box component="span" sx={{fontWeight: 'bold'}}>
                            Depth:
                        </Box>{' '}
                        {depth !== null ? `${depth} m` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" component="div">
                        <Box component="span" sx={{fontWeight: 'bold'}}>
                            Time:
                        </Box>{' '}
                        {time !== null ? new Date(time).toLocaleString() : 'N/A'}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}