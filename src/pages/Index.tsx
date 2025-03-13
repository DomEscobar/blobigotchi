import React, { useState, useEffect } from 'react';
import CRTOverlay from '@/components/CRTOverlay';
import StatusBar from '@/components/StatusBar';
import ActionButton from '@/components/ActionButton';
import Habitat from '@/components/Habitat';
import EvolutionMeter from '@/components/EvolutionMeter';
import { Heart, Droplet, Flame, Battery, Gamepad, Sparkles, Bath, Utensils, Settings } from 'lucide-react';
import { BlobMood } from '@/components/Blob';
import { toast } from "sonner";

const Index = () => {
  // Blob stats state
  const [hunger, setHunger] = useState(80);
  const [happiness, setHappiness] = useState(70);
  const [hygiene, setHygiene] = useState(90);
  const [energy, setEnergy] = useState(60);
  const [evolutionLevel, setEvolutionLevel] = useState(1);
  const [evolutionProgress, setEvolutionProgress] = useState(25);
  const [mood, setMood] = useState<BlobMood>('normal');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionCounter, setActionCounter] = useState(0);

  // Update blob's mood based on stats
  useEffect(() => {
    if (hunger < 20) {
      setMood('hungry');
    } else if (happiness < 20) {
      setMood('sad');
    } else if (hygiene < 20) {
      setMood('sick');
    } else if (energy < 20) {
      setMood('tired');
    } else if (happiness > 80 && hunger > 60 && hygiene > 60) {
      setMood('happy');
    } else {
      setMood('normal');
    }
  }, [hunger, happiness, hygiene, energy]);

  // Decrease stats over time (simulating needs growing over time)
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 1));
      setHappiness(prev => Math.max(0, prev - 0.5));
      setHygiene(prev => Math.max(0, prev - 0.3));
      setEnergy(prev => Math.max(0, prev - 0.7));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Actions
  const feedBlob = () => {
    const newHunger = Math.min(100, hunger + 20);
    setHunger(newHunger);
    setEnergy(prev => Math.min(100, prev + 5));
    setHygiene(prev => Math.max(0, prev - 5));
    
    setLastAction('feed');
    increaseEvolution();
    showActionFeedback('Yum! Blob is eating...', '🍔');
  };

  const playWithBlob = () => {
    const newHappiness = Math.min(100, happiness + 25);
    setHappiness(newHappiness);
    setEnergy(prev => Math.max(0, prev - 15));
    setHunger(prev => Math.max(0, prev - 10));
    
    setLastAction('play');
    increaseEvolution();
    showActionFeedback('Wheee! Playing is fun!', '🎮');
  };

  const cleanBlob = () => {
    const newHygiene = Math.min(100, hygiene + 30);
    setHygiene(newHygiene);
    setEnergy(prev => Math.max(0, prev - 5));
    
    setLastAction('clean');
    increaseEvolution();
    showActionFeedback('Splish splash! Getting clean!', '🧼');
  };

  const restBlob = () => {
    const newEnergy = Math.min(100, energy + 40);
    setEnergy(newEnergy);
    setHunger(prev => Math.max(0, prev - 5));
    setHappiness(prev => Math.max(0, prev - 5));
    
    setLastAction('rest');
    increaseEvolution();
    showActionFeedback('Zzz... Blob is resting!', '💤');
  };

  const increaseEvolution = () => {
    setActionCounter(prev => {
      const newCount = prev + 1;
      if (newCount % 10 === 0) {
        setEvolutionProgress(prevProgress => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            setEvolutionLevel(prevLevel => prevLevel + 1);
            showActionFeedback('LEVEL UP! Blob has evolved!', '✨', true);
            return 0;
          }
          return newProgress;
        });
      }
      return newCount;
    });
  };

  const handleBlobClick = () => {
    setHappiness(prev => Math.min(100, prev + 5));
    if (actionCounter % 5 === 0) {
      showActionFeedback('Blob loves the attention!', '❤️');
    }
  };

  const showActionFeedback = (message: string, icon: string, important = false) => {
    if (important) {
      toast(message, {
        description: icon.repeat(3),
        duration: 5000,
        className: "pixel-text bg-crt-background border border-blob-tertiary text-white",
      });
    } else {
      toast(message, {
        description: icon,
        duration: 3000,
        className: "pixel-text bg-crt-background border border-gray-700 text-white",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-md">
        <div className="relative">
          <CRTOverlay className="rounded-xl overflow-hidden border-4 border-gray-800">
            <div className="flex flex-col h-[600px]">
              <div className="grid grid-cols-2 gap-2 p-4 z-10">
                <div className="space-y-2">
                  <StatusBar 
                    label="Hunger" 
                    value={hunger} 
                    icon={Flame} 
                    color="blob-hungry" 
                  />
                  <StatusBar 
                    label="Happiness" 
                    value={happiness} 
                    icon={Heart} 
                    color="blob-happy" 
                  />
                </div>
                <div className="space-y-2">
                  <StatusBar 
                    label="Hygiene" 
                    value={hygiene} 
                    icon={Droplet} 
                    color="blob-sick" 
                  />
                  <StatusBar 
                    label="Energy" 
                    value={energy} 
                    icon={Battery} 
                    color="blob-tired" 
                  />
                </div>
                <EvolutionMeter 
                  level={evolutionLevel} 
                  progress={evolutionProgress} 
                  className="col-span-2 mt-1" 
                />
              </div>
              
              <div className="flex-1 relative">
                <Habitat mood={mood} onBlobClick={handleBlobClick} />
              </div>
              
              <div className="grid grid-cols-5 gap-1 p-3 bg-gray-900/70 border-t border-gray-700">
                <ActionButton 
                  label="Feed" 
                  icon={Utensils} 
                  onClick={feedBlob} 
                  disabled={hunger >= 100}
                />
                <ActionButton 
                  label="Play" 
                  icon={Gamepad} 
                  onClick={playWithBlob}
                  disabled={energy <= 10}
                />
                <ActionButton 
                  label="Clean" 
                  icon={Bath} 
                  onClick={cleanBlob}
                  disabled={hygiene >= 100}
                />
                <ActionButton 
                  label="Rest" 
                  icon={Sparkles} 
                  onClick={restBlob}
                  disabled={energy >= 100}
                />
                <ActionButton 
                  label="Settings" 
                  icon={Settings} 
                  onClick={() => showActionFeedback('Settings coming soon!', '⚙️')}
                />
              </div>
            </div>
          </CRTOverlay>
          
          <div className="absolute -top-6 left-0 right-0 flex justify-center">
            <div className="bg-crt-dark px-6 py-2 rounded-full border-2 border-blob-tertiary shadow-lg">
              <span className="pixel-text text-lg bg-gradient-to-r from-blob-primary via-blob-secondary to-blob-tertiary bg-clip-text text-transparent">
                PixelBlob Life
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Take good care of your virtual pet! Interact regularly to help it evolve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
