import React from 'react';
import {Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const InfoBox = ({data, onClose}) => {
    if (!data) return null;

    const longitude = data.coordinate[0];
    const latitude = data.coordinate[1];
    const {temperature, salinity, u_velocity, v_velocity} = data.object.properties;

    return (
        <Box
            sx={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 100,
                width: '30%',
                backgroundColor: 'rgba(0, 30, 60, 0.8)',
                borderRadius: 1,
                p: 2,
                boxShadow: 3,
                color: 'white'
            }}
        >
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography component="div">
                    Cell Data
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'white' }}>Latitude</TableCell>
                            <TableCell sx={{ color: 'white' }}>Longitude</TableCell>
                            <TableCell sx={{ color: 'white' }}>Temperature</TableCell>
                            <TableCell sx={{ color: 'white' }}>Salinity</TableCell>
                            <TableCell sx={{ color: 'white' }}>U Velocity</TableCell>
                            <TableCell sx={{ color: 'white' }}>V Velocity</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ color: 'white' }}>{parseFloat(latitude).toFixed(4)}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{parseFloat(longitude).toFixed(4)}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{parseFloat(temperature).toFixed(2)}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{parseFloat(salinity).toFixed(2)}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{parseFloat(u_velocity).toFixed(2)}</TableCell>
                            <TableCell sx={{ color: 'white' }}>{parseFloat(v_velocity).toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};