import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const formatDatasetId = (id) => {
    if (!id) return '';
    return id
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function InfoCard({dataset_id, depth, time}) {
    return (
        <Card
            sx={{
                position: 'absolute',
                top: 100,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(8px)',
                color: 'black',
                p: 2,
            }}
        >
            <CardContent sx={{p: 0, m: 0, pb: '0 !important'}}>
                <Box sx={{display: 'flex', gap: 2}}>
                    <Typography variant="body2" component="div" sx={{marginRight: 2}}>
                        <Box component="span" sx={{fontWeight: 'bold'}}>
                            Dataset:
                        </Box>{' '}
                        {formatDatasetId(dataset_id)}
                    </Typography>
                    <Typography variant="body2" component="div">
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
                </Box>
            </CardContent>
        </Card>
    );
}