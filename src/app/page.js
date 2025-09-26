import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import OceanViewer from './OceanViewer';
import Header from '@/app/Header';


function Loading() {
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
      <Typography variant="h5">Loading Map Viewer...</Typography>
    </Box>
  );
}

export default function Page() {
  return (
    <main>
      <Header />
      <Suspense fallback={<Loading />}>
        <OceanViewer />
      </Suspense>
    </main>
  );
}