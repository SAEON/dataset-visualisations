import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

export default function ColourLegend({ currentThreshold, variableColors, selectedLayer }) {
    if (!currentThreshold) {
        return null;
    }

    const { min_value, max_value } = currentThreshold;
    const valueRange = max_value - min_value;
    const step = valueRange / (variableColors.length - 1);

    const getUnitLabel = (layer) => {
        if (layer === 'temperature') {
            return '°C';
        } else if (layer === 'salinity') {
            return 'PSU';
        }
        return '';
    };

    const unitLabel = getUnitLabel(selectedLayer);

    const reversedColors = [...variableColors].reverse();

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 40,
                left: 16,
                boxShadow: 3,
                backdropFilter: 'blur(8px)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                p: 1,
                borderRadius: 1,
            }}
        >
            <Typography variant="body2" sx={{fontWeight: 'bold', textAlign: 'center', mb: 1, color: 'black'}}>
                {selectedLayer === 'temperature' ? 'Temperature' : 'Salinity'} ({unitLabel})
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    mx: 'auto',
                    borderRadius: 1
                }}
            >
                {reversedColors.map((color, index) => {
                    const originalIndex = (reversedColors.length - 1) - index;
                    const value = min_value + (originalIndex * step);

                    const [r, g, b, a] = color;
                    const bgColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;

                    return (
                        <Grid container key={index} alignItems="center" sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.5)',
                            color: 'black',
                            gap: 1,
                            p: 0.5,
                            mt: '-1px'
                        }}>
                            <Box sx={{
                                width: 20,
                                height: 10,
                                bgcolor: bgColor,
                                borderRadius: 0.5,
                            }} />
                            <Typography variant="caption" sx={{color: 'black'}}>
                                {value.toFixed(2)}
                            </Typography>
                        </Grid>
                    );
                })}
            </Box>
        </Box>
    );
}