import { useState, useEffect } from 'react';
import { StoriesBar } from './StoriesBar';
import { PostCard, type PostProps } from './PostCard';
import { Loader2 } from 'lucide-react';

export function FeedView() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        
        // Map backend post structure to frontend PostProps
        const mappedPosts: PostProps[] = data.map((p: any) => ({
          id: p.id.toString(),
          user: { 
            username: p.username, 
            avatar: p.userimage || `https://ui-avatars.com/api/?name=${p.username}&background=random` 
          },
          image: p.postimage,
          caption: p.caption,
          likes: p.likes,
          timeAgo: 'RECENTLY', // Backend doesn't have timestamp yet, we'll add it later
          isLiked: p.isliked === 1
        }));

        setPosts(mappedPosts);
      } catch (err) {
        setError('Could not load feed. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="w-full flex-col items-center">
      <div className="w-full max-w-lg mx-auto bg-card min-h-screen pb-24 border-x border-border/30 shadow-2xl">
        <StoriesBar />

        <div className="flex flex-col w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-medium">Brewing your feed...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
              <p className="text-muted-foreground text-sm font-medium">No posts yet. Be the first to post!</p>
            </div>
          )}
        </div>

        {/* Footer padding to ensure scroll clears the floating menu */}
        {!isLoading && !error && posts.length > 0 && (
          <div className="h-16 w-full flex items-center justify-center">
            <span className="text-muted-foreground/30 text-xs tracking-[0.2em] font-bold uppercase">You've caught up!</span>
          </div>
        )}
      </div>
    </div>
  );
}
