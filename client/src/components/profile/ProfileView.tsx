import { useState, useEffect } from 'react';
import { PostProps } from '../feed/PostCard';
import { Loader2, Grid, Bookmark, User as UserIcon, Heart, MessageCircle } from 'lucide-react';

export function ProfileView() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${username}/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        
        const mappedPosts: PostProps[] = data.map((p: any) => ({
          id: p.id.toString(),
          user: { 
            username: p.username, 
            avatar: p.userimage || `https://ui-avatars.com/api/?name=${p.username}&background=random` 
          },
          image: p.postimage,
          caption: p.caption,
          likes: p.likes,
          timeAgo: 'RECENTLY',
          isLiked: p.isliked === 1,
          comment_count: p.comment_count
        }));

        setPosts(mappedPosts);
      } catch (err) {
        setError('Could not load profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [username]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-24">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20 mb-12 border-b border-border pb-12">
        <div className="relative">
          <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[3px]">
            <img 
              src={`https://ui-avatars.com/api/?name=${username}&size=128`} 
              alt={username} 
              className="w-full h-full rounded-full border-4 border-background object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h2 className="text-xl md:text-2xl font-light">{username}</h2>
            <div className="flex gap-2">
              <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                Edit profile
              </button>
              <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                View archive
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-10">
            <div className="flex flex-col md:flex-row items-center md:gap-1">
              <span className="font-bold">{posts.length}</span>
              <span className="text-muted-foreground md:text-foreground">posts</span>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-1">
              <span className="font-bold">128</span>
              <span className="text-muted-foreground md:text-foreground">followers</span>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-1">
              <span className="font-bold">256</span>
              <span className="text-muted-foreground md:text-foreground">following</span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="font-bold text-sm">{username}</h1>
            <p className="text-sm text-foreground/80 leading-snug">
              Code. Create. Repeat. 🚀<br />
              Building the future of the private web.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-t border-border mt-[-1px] mb-8">
        <div className="flex gap-12">
          <button className="flex items-center gap-2 py-4 border-t border-foreground text-xs font-bold tracking-widest uppercase">
            <Grid className="w-3 h-3" />
            Posts
          </button>
          <button className="flex items-center gap-2 py-4 text-muted-foreground text-xs font-bold tracking-widest uppercase hover:text-foreground transition-colors">
            <Bookmark className="w-3 h-3" />
            Saved
          </button>
          <button className="flex items-center gap-2 py-4 text-muted-foreground text-xs font-bold tracking-widest uppercase hover:text-foreground transition-colors">
            <UserIcon className="w-3 h-3" />
            Tagged
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-8">
          {posts.map((post) => (
            <div key={post.id} className="relative group aspect-square cursor-pointer overflow-hidden">
              <img 
                src={post.image} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Post thumbnail"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                <div className="flex items-center gap-1">
                  <Heart className="w-6 h-6 fill-white" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>{post.comment_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-4">
                <Grid className="w-8 h-8 text-muted-foreground" />
            </div>
          <h3 className="text-xl font-bold">No Posts Yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mt-2">
            When you share photos, they will appear here on your profile.
          </p>
        </div>
      )}
    </div>
  );
}
