'use client';
import dynamic from 'next/dynamic';
import { Layers3 } from 'lucide-react';
export const SceneView = dynamic(
  () => import('@/components/simulation/TownshipScene'),
  {
    ssr: false,
    loading: () => (
      <div className="scene-panel scene-loading">
        <Layers3 size={28} />
        <strong>Preparing the landscape</strong>
        <p>Loading the Elmina reference environment.</p>
      </div>
    ),
  }
);
