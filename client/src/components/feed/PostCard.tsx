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
  comment_count?: number;
}

interface Comment {
  id: number;
  username: string;
  text: string;
  created_at: string;
}

export function PostCard({ post }: { post: PostProps }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likes);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLike = async () => {
    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? likes + 1 : likes - 1;
    
    // Optimistic update
    setIsLiked(newLikedState);
    setLikes(newLikesCount);
    if (newLikedState) triggerDoubleTapAnimation();

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLiked: newLikedState, likes: newLikesCount })
      });
    } catch (err) {
      console.error('Failed to sync like:', err);
      // Revert on error
      setIsLiked(!newLikedState);
      setLikes(newLikesCount === likes + 1 ? likes : likes + 1);
    }
  };

  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        setShowComments(true);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, text: newComment })
      });

      if (response.ok) {
        const data = await response.json();
        const freshComment: Comment = {
          id: data.id,
          username: username || 'anonymous',
          text: newComment,
          created_at: data.created_at
        };
        setComments([...comments, freshComment]);
        setNewComment('');
        if (!showComments) setShowComments(true);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDoubleTap = () => {
    if (!isLiked) {
      toggleLike();
    } else {
      triggerDoubleTapAnimation();
    }
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
            <button onClick={fetchComments} className="hover:scale-110 active:scale-90 transition-transform text-foreground hover:text-primary">
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
        <button onClick={fetchComments} className="text-sm text-muted-foreground font-medium mb-2 hover:underline">
          {showComments 
            ? 'Hide comments' 
            : `View all ${post.comment_count !== undefined ? post.comment_count : '...'} comments`
          }
        </button>

        {/* Real Comments list */}
        {showComments && (
          <div className="flex flex-col gap-2 mt-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-bold mr-2">{comment.username}</span>
                <span className="text-foreground/80">{comment.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2 border-t border-border/10 pt-3">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/50"
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
            className="text-primary font-bold text-sm disabled:opacity-30 hover:text-primary/80 transition-colors"
          >
            Post
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-semibold">
          {post.timeAgo}
        </div>
      </div>
    </article>
  );
}
