import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getAvatarUrl } from '../data/avatars';
import { COSMETICS } from '../data/cosmetics';

interface AvatarWithFrameProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  avatarId?: string;
  accessories?: { hat?: string; glasses?: string };
  frameId?: string;
  photoURL?: string;
  uid?: string;
}

const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({ 
  className = '', 
  size = 'md',
  avatarId: propAvatarId,
  accessories: propAccessories,
  frameId: propFrameId,
  photoURL: propPhotoURL
}) => {
  const storeAvatarId = useStore(state => state.avatarId);
  const storeAccessories = useStore(state => state.accessories);
  const storeEquippedFrame = useStore(state => state.equippedFrame);
  const storePhotoURL = useStore(state => state.photoURL);
  
  const avatarId = propAvatarId || storeAvatarId;
  const accessories = propAccessories || storeAccessories;
  const equippedFrame = propFrameId || storeEquippedFrame;
  const photoURL = propPhotoURL || storePhotoURL;
  
  const avatarUrl = useMemo(() => {
    // If we have a custom photoURL and we are using the default avatar, prioritize the photo
    if (photoURL && (avatarId === 'vault_boy' || !avatarId)) {
      return photoURL;
    }
    return getAvatarUrl(avatarId, accessories);
  }, [avatarId, accessories, photoURL]);
  const frame = useMemo(() => COSMETICS.find(c => c.id === equippedFrame), [equippedFrame]);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Frame Effect */}
      {frame && frame.id !== 'default_frame' && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img 
            src={frame.imageUrl} 
            alt="Frame" 
            className="w-full h-full object-contain scale-125 opacity-80 animate-pulse" 
            style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }}
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      
      {/* Avatar Image */}
      <div className={`w-full h-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 ${frame && frame.id !== 'default_frame' ? 'border-transparent' : 'border-slate-200 dark:border-slate-700'}`}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default AvatarWithFrame;
