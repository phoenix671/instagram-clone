import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStoryModal({ isOpen, onClose, onSuccess }: CreateStoryModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setFile(selectedFile);
    }
  };

  const handleShare = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);
    formData.append('username', localStorage.getItem('username') || 'anonymous');
    formData.append('userImage', `https://ui-avatars.com/api/?name=${localStorage.getItem('username')}&background=random`);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stories/new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setPreviewUrl(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Failed to upload story:', err);
      alert('Connection error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (isUploading) return;
    setPreviewUrl(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md bg-[#121212] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-center font-bold">Create Story</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
          {previewUrl ? (
            <div className="relative w-full aspect-[9/16] max-h-[500px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img src={previewUrl} alt="Story Preview" className="max-w-full max-h-full object-contain" />
              {!isUploading && (
                <button 
                  onClick={() => { setPreviewUrl(null); setFile(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-colors hover:bg-white/5"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-400">Select photo from computer</p>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />
        </div>

        <DialogFooter className="sm:justify-between border-t border-white/10 pt-4">
          <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            disabled={!previewUrl || isUploading} 
            onClick={handleShare}
            className="bg-gradient-to-r from-primary to-blue-500 font-bold min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : 'Share to Story'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
