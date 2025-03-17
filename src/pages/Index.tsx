
import React from 'react';
import CRTOverlay from '@/components/CRTOverlay';
import Habitat from '@/components/Habitat';
import StatsPanel from '@/components/StatsPanel';
import ActionPanel from '@/components/ActionPanel';
import TitleBar from '@/components/TitleBar';
import Footer from '@/components/Footer';
import { useBlobStats } from '@/hooks/useBlobStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/hooks/useSettings';
import { useGunDB } from '@/hooks/useGunDB';

const Index = () => {
  const isMobile = useIsMobile();
  const { stats, actions } = useBlobStats();
  const { settings } = useSettings();
  const { isConnected } = useGunDB();
  
  return (
    <div className="flex items-center justify-center min-h-screen p-2 md:p-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="relative">
          {isConnected && (
            <div className="absolute top-2 right-2 z-10 bg-green-500/20 px-2 py-1 rounded-full">
              <span className="text-[10px] text-green-500 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                P2P Connected
              </span>
            </div>
          )}
          
          <CRTOverlay 
            className="rounded-xl overflow-hidden border-4 border-gray-800"
            mood={stats.mood}
          >
            <div className="flex flex-col h-[600px] md:h-[650px]">
              <StatsPanel stats={stats} />
              
              <div className="flex-1 relative">
                <Habitat 
                  mood={stats.mood} 
                  onBlobClick={actions.handleBlobClick}
                  evolutionLevel={stats.evolutionLevel} 
                />
              </div>
              
              <ActionPanel stats={stats} actions={actions} />
            </div>
          </CRTOverlay>
          
          <TitleBar />
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;
