import React, { useState } from 'react';
import CRTOverlay from '@/components/CRTOverlay';
import Habitat from '@/components/Habitat';
import StatsPanel from '@/components/StatsPanel';
import ActionPanel from '@/components/ActionPanel';
import TitleBar from '@/components/TitleBar';
import Footer from '@/components/Footer';
import { useBlobStatsRedux } from '@/hooks/useBlobStatsRedux';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettingsRedux } from '@/hooks/useSettingsRedux';
import BlobBattlegroundsWithProvider from '@/components/BlobBattlegrounds';
import { useBattle } from '@/contexts/BattleContext';
import AttackOfferModal from '@/components/AttackOfferModal';

const Index = () => {
  const isMobile = useIsMobile();
  const { stats, actions, attackModalProps, showAttackOfferModal } = useBlobStatsRedux();
  const { settings } = useSettingsRedux();
  const [isBattlegroundsOpen, setIsBattlegroundsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen p-2 md:p-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="relative">

          <CRTOverlay
            className="rounded-xl overflow-hidden border-4 border-gray-800"
            mood={stats.mood}
          >
            <div className="flex flex-col h-[600px] md:h-[650px]">
              <StatsPanel stats={stats} />

              <div className="flex-1 relative">
                <Habitat
                  isBattlegroundsOpen={isBattlegroundsOpen}
                  setIsBattlegroundsOpen={setIsBattlegroundsOpen}
                  mood={stats.mood}
                  onBlobClick={actions.handleBlobClick}
                  evolutionLevel={stats.evolutionLevel}
                />
              </div>

              <ActionPanel stats={stats} actions={actions} />

              {/* Battle system dialog - render outside of Habitat container to avoid size constraints */}
              {isBattlegroundsOpen && (
                <BlobBattlegroundsWithProvider
                  evolutionLevel={stats.evolutionLevel}
                  onClose={() => setIsBattlegroundsOpen(false)}
                />
              )}
            </div>
          </CRTOverlay>

          <TitleBar />
        </div>

        <Footer />
      </div>

      {/* Attack Offer Modal */}
      {showAttackOfferModal && <AttackOfferModal {...attackModalProps} />}
    </div>
  );
};

export default Index;
