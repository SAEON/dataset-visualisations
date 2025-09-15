import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';

export default function TimeSlider({time, setTime, times, timeMarks}) {
    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 40,
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
    );
}