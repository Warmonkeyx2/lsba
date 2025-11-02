import { useRef, useState } from "react";
import { Upload, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onClear: () => void;
  id: string;
  placeholder?: string;
  helperText?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onClear,
  id,
  placeholder = "https://example.com/image.jpg or upload a file",
  helperText,
  maxSizeMB = 2
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange(dataUrl);
        toast.success('Image uploaded successfully!');
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isDataUrl = value?.startsWith('data:');

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          id={id}
          placeholder={placeholder}
          value={isDataUrl ? '' : (value || '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDataUrl}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="shrink-0"
          title="Upload image file"
        >
          <Upload className="w-4 h-4" />
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="shrink-0"
            title="Clear image"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {helperText && (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      )}
      {isDataUrl && value && (
        <p className="text-xs text-accent-foreground mt-1">
          ✓ Using uploaded image file
        </p>
      )}
      {value && (
        <div className="mt-2 p-4 bg-muted rounded-lg flex justify-center">
          <img 
            src={value} 
            alt="Preview" 
            className="max-h-32 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
