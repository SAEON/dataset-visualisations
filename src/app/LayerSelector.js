import React from 'react';
import {FormControl, FormControlLabel, Radio, RadioGroup, Typography} from '@mui/material';
import Box from '@mui/material/Box';

export default function LayerSelector({selectedLayer, onLayerChange}) {
    return (
        <Box
            sx={{
                position: 'absolute',
                top: '150px',
                left: '20px',
                zIndex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                p: 2,
                borderRadius: 1,
                boxShadow: 3,
            }}
        >
            <Typography sx={{fontWeight: 'bold', mb: 1, color: 'black'}}>Layer</Typography>
            <FormControl component="fieldset">
                <RadioGroup
                    aria-label="layer"
                    name="layer-radio-buttons-group"
                    value={selectedLayer}
                    onChange={(e) => onLayerChange(e.target.value)}
                >
                    <FormControlLabel value="temperature" control={<Radio/>} label="Temperature"/>
                    <FormControlLabel value="salinity" control={<Radio/>} label="Salinity"/>
                </RadioGroup>
            </FormControl>
        </Box>
    );
}