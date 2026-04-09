import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Loader2, Image as ImageIcon, Film } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError('');

    const isVideo = file.type.startsWith('video/');
    const endpoint = isVideo ? '/api/reels/new' : '/api/posts/new';
    
    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);
    formData.append('username', localStorage.getItem('username') || 'anonymous');
    formData.append('userImage', `https://ui-avatars.com/api/?name=${localStorage.getItem('username') || 'A'}&background=random`);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const isVideo = file?.type.startsWith('video/');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUploading && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center font-bold text-lg">Create New Post</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center min-h-[400px] max-h-[80vh] overflow-y-auto p-0">
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-6 cursor-pointer p-10 text-center w-full h-full"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <div className="relative">
                  <ImageIcon className="w-12 h-12" />
                  <Film className="w-8 h-8 absolute -bottom-2 -right-2 bg-card rounded-md p-1 border border-border" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Select Photos or Videos</h3>
                <p className="text-muted-foreground text-sm">Drag and drop or click to browse</p>
              </div>
              <Button type="button" variant="default" className="rounded-xl font-bold">
                Select from computer
              </Button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              {/* Preview Container */}
              <div className="relative w-full aspect-square bg-black flex items-center justify-center">
                {isVideo ? (
                  <video src={previewUrl} className="max-w-full max-h-full object-contain" controls autoPlay muted loop />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                )}
                {!isUploading && (
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Caption Area */}
              <div className="p-4 border-t border-border bg-card/50">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${localStorage.getItem('username') || 'User'}`} 
                    className="w-8 h-8 rounded-full" 
                    alt="User"
                  />
                  <span className="font-bold text-sm">{localStorage.getItem('username')}</span>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full bg-transparent border-none outline-none resize-none text-sm min-h-[100px]"
                  disabled={isUploading}
                />
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden" 
          />
        </div>

        {error && <p className="text-red-500 text-xs px-4 py-2 text-center bg-red-500/10 border-y border-red-500/20">{error}</p>}

        {previewUrl && (
          <DialogFooter className="p-4 border-t border-border flex sm:justify-between items-center bg-card">
            <Button 
                variant="ghost" 
                onClick={handleClose} 
                disabled={isUploading}
                className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
