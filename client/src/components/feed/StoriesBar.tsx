import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { StoryViewer, type Story } from './StoryViewer';
import { CreateStoryModal } from './CreateStoryModal';

export function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const username = localStorage.getItem('username');

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Group stories by user (basic implementation: just show all stories)
        // In a real app, you'd group them so one ring per user. 
        // For now, let's just map the raw data to the Story interface.
        const mappedStories: Story[] = data.map((s: any) => ({
          id: s.id,
          user: s.username,
          avatar: s.userimage || `https://ui-avatars.com/api/?name=${s.username}&background=random`,
          storyImage: s.storyimage,
          hasUnseen: true // Logic for unseen can be added later
        }));
        setStories(mappedStories);
      }
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <>
      <div className="w-full bg-card border-b py-4">
        <div className="flex flex-nowrap overflow-x-auto gap-4 px-4 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Your Story Button */}
          <div onClick={() => setIsCreatingStory(true)} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
            <div className="relative w-16 h-16 rounded-full p-[2px] bg-border border border-border/30 transition-transform group-hover:scale-105 duration-200">
              <div className="w-full h-full rounded-full bg-background p-1">
                <img 
                  src={`https://ui-avatars.com/api/?name=${username}&background=random`} 
                  alt="Your Story" 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-primary w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-md">
                <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium mt-1">Your story</span>
          </div>

          {/* Real Stories */}
          {isLoading ? (
            <div className="flex items-center gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-16 h-16 rounded-full bg-border/20 animate-pulse" />
               ))}
            </div>
          ) : stories.length > 0 ? (
            stories.map((story, i) => (
              <div 
                key={story.id} 
                onClick={() => setSelectedStoryIndex(i)} 
                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group"
              >
                <div className={`relative w-16 h-16 rounded-full p-[2px] ${story.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-primary to-purple-500' : 'bg-border'} transition-transform group-hover:scale-105 duration-200 shadow-sm`}>
                  <div className="w-full h-full rounded-full bg-background p-[2px]">
                    <img src={story.avatar} alt={story.user} className="w-full h-full rounded-full object-cover border border-white/5" />
                  </div>
                </div>
                <span className="text-xs text-foreground/80 font-medium truncate w-16 text-center mt-1">{story.user}</span>
              </div>
            ))
          ) : null}
          
        </div>
        
        <style>{`
          .flex.overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Full Screen Story Viewer Overlay */}
      {selectedStoryIndex !== null && (
        <StoryViewer 
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal 
        isOpen={isCreatingStory} 
        onClose={() => setIsCreatingStory(false)} 
        onSuccess={fetchStories}
      />
    </>
  );
}
