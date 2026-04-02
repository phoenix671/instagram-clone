
import { StoriesBar } from './StoriesBar';
import { PostCard, type PostProps } from './PostCard';

const MOCK_POSTS: PostProps[] = [
  {
    id: 'post_1',
    user: { username: 'alex_codes', avatar: 'https://i.pravatar.cc/150?u=1' },
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    caption: 'Finally finishing my new mechanical keyboard build. The switches sound heavenly! ⌨️🎶 #mechanicalkeyboard #setup',
    likes: 1243,
    timeAgo: '2 HOURS AGO',
    isLiked: false
  },
  {
    id: 'post_2',
    user: { username: 'neon_nights', avatar: 'https://i.pravatar.cc/150?u=2' },
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    caption: 'Cyberpunk aesthetic is taking over the city tonight. Finding the best alleyways for neon reflections. 🌃🔦',
    likes: 899,
    timeAgo: '4 HOURS AGO',
    isLiked: true
  },
  {
    id: 'post_3',
    user: { username: 'web3_wizard', avatar: 'https://i.pravatar.cc/150?u=6' },
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f438eba',
    caption: 'Another late night shipping code! The next major version is dropping soon! Stay tuned and keep hacking. 🚀💻',
    likes: 4210,
    timeAgo: '6 HOURS AGO',
    isLiked: false
  }
];

export function FeedView() {
  return (
    <div className="w-full flex-col items-center">
      {/* Set max width to standard IG size (around 470px center column on desktop) */}
      <div className="w-full max-w-lg mx-auto bg-card min-h-screen pb-24 border-x border-border/30 shadow-2xl">
        <StoriesBar />
        
        <div className="flex flex-col w-full">
          {MOCK_POSTS.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {/* Footer padding to ensure scroll clears the floating menu */}
        <div className="h-16 w-full flex items-center justify-center">
           <span className="text-muted-foreground/30 text-xs tracking-[0.2em] font-bold uppercase">You've caught up!</span>
        </div>
      </div>
    </div>
  );
}
