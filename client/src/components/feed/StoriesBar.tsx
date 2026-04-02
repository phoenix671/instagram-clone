import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { StoryViewer, type Story } from './StoryViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const MOCK_STORIES: Story[] = [
  { id: 1, user: 'alex_codes', avatar: 'https://i.pravatar.cc/150?u=1', storyImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', hasUnseen: true },
  { id: 2, user: 'neon_nights', avatar: 'https://i.pravatar.cc/150?u=2', storyImage: 'https://images.unsplash.com/photo-1639762681485-074b7f438eba', hasUnseen: true },
  { id: 3, user: 'hacker_girl', avatar: 'https://i.pravatar.cc/150?u=3', storyImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', hasUnseen: false },
  { id: 4, user: 'cyber_punk', avatar: 'https://i.pravatar.cc/150?u=4', storyImage: 'https://images.unsplash.com/photo-1531297122539-5692f69dc800', hasUnseen: true },
  { id: 5, user: 'dev_ops_ninja', avatar: 'https://i.pravatar.cc/150?u=5', storyImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb', hasUnseen: false },
  { id: 6, user: 'web3_wizard', avatar: 'https://i.pravatar.cc/150?u=6', storyImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', hasUnseen: true },
];

export function StoriesBar() {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Triggered via Your Story "+" icon
  const handleCreateStory = () => {
    setFilePreview(null);
    setIsCreatingStory(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <div className="w-full bg-card border-b py-4">
        {/* Make flex-nowrap to keep them strictly horizontal */}
        <div className="flex flex-nowrap overflow-x-auto gap-4 px-4 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Your Story Button */}
          <div onClick={handleCreateStory} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
            <div className="relative w-16 h-16 rounded-full p-[2px] bg-border border border-border/30 transition-transform group-hover:scale-105 duration-200">
              <div className="w-full h-full rounded-full bg-background p-1">
                <img src="https://i.pravatar.cc/150?u=me" alt="Your Story" className="w-full h-full rounded-full object-cover" />
              </div>
              {/* Glowing Add Button Badge */}
              <div className="absolute bottom-0 right-0 bg-primary w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-md">
                <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium mt-1">Your story</span>
          </div>

          {/* Other Users' Stories */}
          {MOCK_STORIES.map((story, i) => (
            <div 
              key={story.id} 
              onClick={() => setSelectedStoryIndex(i)} 
              className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group"
            >
              {/* Gradient border ring for unseen stories */}
              <div className={`relative w-16 h-16 rounded-full p-[2px] ${story.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-primary to-purple-500' : 'bg-border'} transition-transform group-hover:scale-105 duration-200 shadow-sm`}>
                <div className="w-full h-full rounded-full bg-background p-[2px]">
                  <img src={story.avatar} alt={story.user} className="w-full h-full rounded-full object-cover border border-white/5" />
                </div>
              </div>
              <span className="text-xs text-foreground/80 font-medium truncate w-16 text-center mt-1">{story.user}</span>
            </div>
          ))}
          
        </div>
        
        {/* Utility to hide standard scrollbar in webkit browsers */}
        <style>{`
          .flex.overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Full Screen Story Viewer Overlay */}
      {selectedStoryIndex !== null && (
        <StoryViewer 
          stories={MOCK_STORIES}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      {/* Create Story Mock Upload Dialog */}
      <Dialog open={isCreatingStory} onOpenChange={setIsCreatingStory}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary font-bold text-xl">Create Story</DialogTitle>
          </DialogHeader>
          
          {!filePreview ? (
            <label className="flex flex-col flex-1 min-h-[250px] items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-xl bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group relative">
              <input type="file" accept="image/*,video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
              <Plus className="w-12 h-12 text-muted-foreground mb-4 group-hover:text-primary transition-colors animate-pulse" />
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-white transition-colors">
                Click to select a file
              </span>
              <span className="text-xs text-muted-foreground/50 mt-1">
                Supports .jpg, .png or .mp4
              </span>
            </label>
          ) : (
            <div className="relative w-full aspect-[4/5] sm:max-h-[400px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
              <button 
                onClick={() => setFilePreview(null)} 
                className="absolute top-3 right-3 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          
          <div className="flex w-full justify-end mt-2">
            <Button 
              disabled={!filePreview}
              className="w-full sm:w-auto px-8"
              onClick={() => {
                console.log("Mock Image Ready for API:", filePreview);
                setIsCreatingStory(false); // Close dialog directly in mock
              }}>
              Upload & Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
