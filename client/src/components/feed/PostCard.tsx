import { useState } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

export interface PostProps {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  image: string;
  caption: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
}

export function PostCard({ post }: { post: PostProps }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likes);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const toggleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
      triggerDoubleTapAnimation();
    }
  };

  const onDoubleTap = () => {
    if (!isLiked) {
      setLikes(likes + 1);
      setIsLiked(true);
    }
    triggerDoubleTapAnimation();
  };

  const triggerDoubleTapAnimation = () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 1000);
  };

  return (
    <article className="w-full bg-card border-b border-border/30 sm:border-x sm:rounded-2xl sm:my-6 sm:shadow-2xl overflow-hidden flex flex-col">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px] cursor-pointer hover:opacity-80 transition-opacity">
            <img src={post.user.avatar} alt={post.user.username} className="w-full h-full rounded-full border border-background object-cover" />
          </div>
          <span className="font-semibold text-sm hover:text-primary cursor-pointer transition-colors">{post.user.username}</span>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-2">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Media - Soft rounded styling approved in plan */}
      <div 
        className="w-full aspect-square bg-black overflow-hidden relative sm:rounded-none group cursor-pointer" 
        onDoubleClick={onDoubleTap}
      >
        <img 
          src={post.image} 
          alt="Post content" 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
        />
        
        {/* Heart Burst Double Tap Animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center z-10 select-none pointer-events-none">
            <Heart 
              className="w-24 h-24 text-white fill-white drop-shadow-2xl animate-in zoom-in spin-in-12 duration-300 fade-out-0 fade-in-100" 
            />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className="hover:scale-110 active:scale-90 transition-transform text-foreground hover:text-primary">
              <Heart className={`w-[26px] h-[26px] ${isLiked ? 'fill-primary text-primary' : ''}`} />
            </button>
            <button className="hover:scale-110 active:scale-90 transition-transform text-foreground hover:text-primary">
              <MessageCircle className="w-[26px] h-[26px]" />
            </button>
            <button className="hover:scale-110 active:scale-90 transition-transform text-foreground hover:text-primary">
              <Send className="w-[26px] h-[26px]" />
            </button>
          </div>
          <button className="hover:scale-110 active:scale-90 transition-transform text-foreground hover:text-primary">
            <Bookmark className="w-[26px] h-[26px]" />
          </button>
        </div>

        {/* Engagement Info */}
        <span className="font-bold text-sm block mb-1">{likes.toLocaleString()} likes</span>
        
        {/* Caption */}
        <div className="text-sm mb-2 leading-relaxed">
          <span className="font-bold mr-2 cursor-pointer hover:underline">{post.user.username}</span>
          <span className="text-foreground/90">{post.caption}</span>
        </div>

        {/* Comments section preview */}
        <button className="text-sm text-muted-foreground font-medium mb-2 hover:underline">
          View all 42 comments
        </button>
        
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-semibold">
          {post.timeAgo}
        </div>
      </div>
    </article>
  );
}
