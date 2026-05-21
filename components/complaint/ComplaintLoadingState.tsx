import React from 'react';
import CustomLoadingScreen from '@/components/CustomLoadingScreen';

export function ComplaintLoadingState() {
  return <CustomLoadingScreen message="Cargando reportes..." />;
}
