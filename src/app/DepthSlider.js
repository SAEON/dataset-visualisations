import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

export default function DepthSlider({ depth, setDepth, depths, depthMarks, disabled = false }) {
    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 40,
                right: 20,
                width: 'max-content',
                height: 'max-content',
                py: 1,
                borderRadius: 1,
                bgcolor: 'rgb(0, 30, 60)',
                color: 'white',
            }}
        >
            <Box sx={{ px: '10px', pb: '10px' }}>
                <Typography id="depth-slider" gutterBottom={true}>
                    Depth (m)
                </Typography>
            </Box>
            <Slider
                disabled={disabled}
                size="medium"
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
                    height: '75vh',
                }}
            />
        </Box>
    );
}