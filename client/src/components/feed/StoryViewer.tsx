import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface Story {
  id: number;
  user: string;
  avatar: string;
  storyImage: string;
  hasUnseen: boolean;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const STORY_DURATION = 5000; // 5 seconds
  const currentStory = stories[currentIndex];

  useEffect(() => {
    // Reset progress when index changes
    setProgress(0);
    
    let animationFrame: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      // Initialize start time on first frame
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(newProgress);

      if (elapsed < STORY_DURATION) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        handleNext(); // Auto-advance to next story
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [currentIndex]); // Re-run effect when currentIndex changes

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose(); // Close if we hit the end
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setProgress(0); // Optional: Restart current if it's the very first one
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-full h-full max-w-lg mx-auto bg-gray-950 overflow-hidden flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-4">
          {stories.map((story, i) => (
            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Header */}
        <div className="absolute top-8 left-0 right-0 z-20 flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <img src={currentStory.avatar} alt={currentStory.user} className="w-8 h-8 rounded-full border border-white object-cover" />
            <span className="text-white font-semibold text-sm drop-shadow-md">{currentStory.user}</span>
            <span className="text-white/70 text-xs font-medium ml-1">2h</span>
          </div>
          <button onClick={onClose} className="text-white focus:outline-none hover:opacity-80 transition-opacity">
            <X className="w-6 h-6 drop-shadow-md" />
          </button>
        </div>

        {/* Tap areas for navigation */}
        <div className="absolute inset-0 z-10 flex">
          <div className="flex-1" onClick={handlePrev} />
          {/* Middle/right side advances */}
          <div className="flex-[2]" onClick={handleNext} />
        </div>

        {/* Image Display */}
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src={currentStory.storyImage} 
            alt="Story" 
            className="w-full h-full object-cover animate-in slide-in-from-right-4 duration-300"
            key={currentStory.id} // Changing key forces a fresh CSS animation render on next
          />
          {/* Top gradient for text readability */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
        
      </div>
    </div>
  );
}
