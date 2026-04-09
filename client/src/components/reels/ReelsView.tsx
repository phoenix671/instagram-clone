import { useState, useEffect, useRef } from 'react';
import { Loader2, Heart, MessageCircle, Share2, Music2 } from 'lucide-react';

interface Reel {
  id: number;
  username: string;
  userimage: string;
  videourl: string;
  likes: number;
  caption: string;
}

export function ReelsView() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/reels', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch reels');
        const data = await response.json();
        setReels(data);
      } catch (err) {
        setError('Could not load reels.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReels();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">Loading Reels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-10 text-center">
        <p className="text-red-400 text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-112px)] overflow-y-scroll snap-y snap-mandatory bg-black">
      {reels.map((reel) => (
        <ReelItem key={reel.id} reel={reel} />
      ))}
    </div>
  );
}

function ReelItem({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            videoRef.current?.play().catch(e => console.log("Autoplay blocked", e));
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-112px)] snap-start flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={reel.videourl}
        className="max-h-full w-auto object-contain cursor-pointer"
        loop
        playsInline
        onClick={togglePlay}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        <div className="flex justify-between items-end w-full">
          {/* Reel Info */}
          <div className="flex flex-col gap-3 flex-1 mb-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <img 
                src={reel.userimage || `https://ui-avatars.com/api/?name=${reel.username}`} 
                className="w-8 h-8 rounded-full border border-white/20" 
                alt={reel.username} 
              />
              <span className="font-bold text-white text-sm">@{reel.username}</span>
              <button className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold text-white hover:bg-white/30 transition-colors">
                Follow
              </button>
            </div>
            <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
            <div className="flex items-center gap-2 text-white">
              <Music2 className="w-4 h-4 animate-spin-slow" />
              <span className="text-xs">Original Audio - {reel.username}</span>
            </div>
          </div>

          {/* Side Actions */}
          <div className="flex flex-col items-center gap-6 mb-8 pointer-events-auto">
            <button className="flex flex-col items-center gap-1 group">
              <div className="p-2 rounded-full bg-black/20 group-hover:bg-red-500/20 transition-colors">
                <Heart className="w-7 h-7 text-white group-hover:text-red-500 transition-colors" />
              </div>
              <span className="text-white text-xs font-bold">{reel.likes}</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-full bg-black/20">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs font-bold">42</span>
            </button>
            <button className="p-2 rounded-full bg-black/20">
              <Share2 className="w-7 h-7 text-white" />
            </button>
            <div className="w-8 h-8 rounded-lg border-2 border-white/40 p-1 animate-pulse">
                <img src={reel.userimage} className="w-full h-full rounded-sm object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
