import { useState, useEffect } from 'react'
import FloatingActionMenu from '@/components/ui/floating-action-menu'
import { ParticleTextEffect } from '@/components/ui/particle-text-effect'
import { DottedSurface } from '@/components/ui/dotted-surface'
import { Button } from '@/components/ui/button'
import { Home, Compass, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FeedView } from '@/components/feed/FeedView'
import { ReelsView } from '@/components/reels/ReelsView'
import { CreatePostModal } from '@/components/feed/CreatePostModal'
import { ProfileView } from '@/components/profile/ProfileView'
import { PlusSquare } from 'lucide-react'

function App() {
  const [appState, setAppState] = useState<'entry' | 'login' | 'main'>('entry')
  const [showEntry, setShowEntry] = useState(true)
  const [view, setView] = useState('home')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshContent = () => {
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setAppState('main')
    }
  }, [])

  useEffect(() => {
    if (appState === 'entry') {
      const timer = setTimeout(() => {
        const token = localStorage.getItem('token')
        setShowEntry(false)
        setTimeout(() => {
          if (token) {
            setAppState('main')
          } else {
            setAppState('login')
          }
        }, 1000)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [appState])

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    setError('')
    setIsLoggingIn(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        setAppState('main')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection error. Is the server running?')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setAppState('login')
  }

  if (appState === 'entry' || appState === 'login') {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
        {/* Background is always there, creating a continuous flow! */}
        <DottedSurface className="absolute inset-0 z-0 opacity-80" />

        {/* Entry Text Layer (Fades out via CSS) */}
        {appState === 'entry' && (
          <div
            className={cn(
              "absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-1000",
              showEntry ? "opacity-100" : "opacity-0"
            )}
          >
            <ParticleTextEffect words={["BAD BOIS"]} />
          </div>
        )}

        {/* Login Box Layer (Fades in via CSS) */}
        <div
          className={cn(
            "relative z-10 w-full max-w-sm p-8 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center transition-all duration-1000 delay-500",
            !showEntry || appState === 'login' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 blur-md"
          )}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'cursive' }}>
            Instagram
          </h1>
          <p className="text-sm text-gray-400 font-medium mb-8 uppercase tracking-widest">
            Private Web App
          </p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 mb-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 mb-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
          />
          
          {error && <p className="text-red-400 text-xs mb-4 w-full text-center font-medium">{error}</p>}

          <Button
            className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/30"
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Log In'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col relative pb-20">

      {/* Header */}
      <header className="w-full h-14 bg-card border-b flex items-center justify-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{ fontFamily: 'cursive' }}>
          Instagram
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-0 flex flex-col items-center">
        {view === 'home' && <div className="max-w-lg w-full px-0"><FeedView key={`feed-${refreshKey}`} /></div>}
        {view === 'explore' && <div className="max-w-lg w-full px-0"><ReelsView key={`reels-${refreshKey}`} /></div>}
        {view === 'profile' && <ProfileView key={`profile-${refreshKey}`} />}
      </main>

      {/* Floating Action Menu from 21st.dev! */}
      <FloatingActionMenu
        options={[
          { label: "Profile", Icon: <User className="w-4 h-4" />, onClick: () => setView('profile') },
          { label: "Create", Icon: <PlusSquare className="w-4 h-4" />, onClick: () => setIsCreateModalOpen(true) },
          { label: "Explore", Icon: <Compass className="w-4 h-4" />, onClick: () => setView('explore') },
          { label: "Home", Icon: <Home className="w-4 h-4" />, onClick: () => setView('home') },
          { label: "Logout", Icon: <Settings className="w-4 h-4" />, onClick: handleLogout },
        ]}
      />

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={refreshContent}
      />
    </div>
  )
}

export default App
