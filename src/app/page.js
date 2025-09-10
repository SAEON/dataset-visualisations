'use client'

import React, {useState, useMemo} from 'react';
import {DeckGL} from '@deck.gl/react';
import {MVTLayer} from '@deck.gl/geo-layers';
import {Map} from 'react-map-gl/maplibre';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useSearchParams} from 'next/navigation';

import {useDatasetData} from './DatasetMetadataFetcher';
import {center, depths, depthMarks, getFillColor, variableColors} from '@/app/MapUtils';
import DepthSlider from '@/app/DepthSlider';
import TimeSlider from '@/app/TimeSlider';
import InfoCard from '@/app/InfoCard';
import ColourLegend from '@/app/ColourLegend';
import Header from "@/app/Header";
import LayerSelector from '@/app/LayerSelector';
import {InfoBox} from '@/app/InfoBox';

export default function OceanViewer() {
    const searchParams = useSearchParams();
    const dataset_id = searchParams.get('dataset_id');

    const {data, loading, error, timeMarks, times} = useDatasetData(dataset_id);

    const [viewState, setViewState] = useState({
        longitude: center[0],
        latitude: center[1],
        zoom: 5,
        pitch: 0,
        bearing: 0,
    });

    const initialDepth = 0;
    const [depth, setDepth] = useState(initialDepth);
    const [time, setTime] = useState(null);
    const [selectedLayer, setSelectedLayer] = useState('temperature');
    const [clickedData, setClickedData] = useState(null);
    const [showInfoBox, setShowInfoBox] = useState(false);

    const currentThreshold = useMemo(() => {
        if (!data) return null;
        return data.variables.find((v) => v.name === selectedLayer)?.thresholds.find(
            (t) => t.dependant_value === depth
        );
    }, [data, depth, selectedLayer]);

    React.useEffect(() => {
        if (data && !time) {
            setTime(data.start_date);
        }
    }, [data, time]);

    const martinTileUrl = useMemo(
        () =>
            `http://localhost:3001/get_ocean_data_tile/{z}/{x}/{y}?dataset_id=${dataset_id}&date_time=${encodeURIComponent(
                time
            )}&depth=${depth}&variable_name=${selectedLayer}`,
        [depth, time, dataset_id, selectedLayer]
    );

    const layers = [
        new MVTLayer({
            id: 'croco-mvt-layer',
            data: martinTileUrl,
            key: martinTileUrl,
            minZoom: 0,
            maxZoom: 15,
            getFillColor: (d) => getFillColor(d, currentThreshold, selectedLayer),
            lineWidthUnits: 'meters',
            autoHighlight: true,
            pickable: true,
            onClick: (info) => {
                if (info.object) {
                    setClickedData(info);
                    setShowInfoBox(true);
                }
            },
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
            <Header/>
            <DeckGL
                layers={layers}
                initialViewState={viewState}
                onViewStateChange={(e) => {
                    setViewState(e.viewState);
                }}
                controller={true}
            >
                <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json"/>
            </DeckGL>
            <LayerSelector selectedLayer={selectedLayer} onLayerChange={setSelectedLayer}/>
            <DepthSlider depth={depth} setDepth={setDepth} depths={depths} depthMarks={depthMarks}/>
            <TimeSlider time={time} setTime={setTime} times={times} timeMarks={timeMarks}/>
            <InfoCard dataset_id={dataset_id} depth={depth} time={time}/>
            <ColourLegend
                currentThreshold={currentThreshold}
                variableColors={variableColors}
                selectedLayer={selectedLayer}
            />
            {showInfoBox && (
                <InfoBox
                    data={clickedData}
                    onClose={() => setShowInfoBox(false)}
                />
            )}
        </Box>
    );
}