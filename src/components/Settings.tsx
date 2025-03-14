
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSounds } from '@/hooks/useSounds';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    sound: boolean;
    notifications: boolean;
    theme: 'default' | 'blue' | 'green' | 'pink';
  };
  onSettingsChange: (settings: Partial<SettingsProps['settings']>) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  open, 
  onOpenChange, 
  settings, 
  onSettingsChange 
}) => {
  const { playSoundEffect } = useSounds();
  
  const handleSoundToggle = (checked: boolean) => {
    // If we're enabling sounds, play a sound
    if (checked) {
      playSoundEffect('click');
    }
    onSettingsChange({ sound: checked });
  };
  
  const handleThemeChange = (value: SettingsProps['settings']['theme']) => {
    if (settings.sound) {
      playSoundEffect('click');
    }
    onSettingsChange({ theme: value });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-pixel text-blob-secondary">Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize your virtual pet experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound" className="font-pixel">Sound</Label>
            <Switch 
              id="sound" 
              checked={settings.sound}
              onCheckedChange={handleSoundToggle}
              className="data-[state=checked]:bg-blob-secondary"
            />
          </div>
          
          <Separator className="bg-gray-700" />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="font-pixel">Notifications</Label>
            <Switch 
              id="notifications" 
              checked={settings.notifications}
              onCheckedChange={(checked) => {
                if (settings.sound) playSoundEffect('click');
                onSettingsChange({ notifications: checked });
              }}
              className="data-[state=checked]:bg-blob-secondary"
            />
          </div>
          
          <Separator className="bg-gray-700" />
          
          <div className="space-y-2">
            <Label className="font-pixel">Theme</Label>
            <RadioGroup 
              defaultValue={settings.theme} 
              onValueChange={handleThemeChange}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 bg-gray-700/50 p-2 rounded-md">
                <RadioGroupItem value="default" id="theme-default" className="text-blob-primary" />
                <Label htmlFor="theme-default" className="cursor-pointer">Default</Label>
              </div>
              <div className="flex items-center space-x-2 bg-blue-900/30 p-2 rounded-md">
                <RadioGroupItem value="blue" id="theme-blue" className="text-blue-400" />
                <Label htmlFor="theme-blue" className="cursor-pointer">Blue</Label>
              </div>
              <div className="flex items-center space-x-2 bg-green-900/30 p-2 rounded-md">
                <RadioGroupItem value="green" id="theme-green" className="text-green-400" />
                <Label htmlFor="theme-green" className="cursor-pointer">Green</Label>
              </div>
              <div className="flex items-center space-x-2 bg-pink-900/30 p-2 rounded-md">
                <RadioGroupItem value="pink" id="theme-pink" className="text-pink-400" />
                <Label htmlFor="theme-pink" className="cursor-pointer">Pink</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
