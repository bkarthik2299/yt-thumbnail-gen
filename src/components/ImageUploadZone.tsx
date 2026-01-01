import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadZoneProps {
  onImageUpload: (file: File | null) => void;
  uploadedImage: File | null;
}

export function ImageUploadZone({ onImageUpload, uploadedImage }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateAndSetFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert("Please upload a PNG or JPG image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onImageUpload(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }, [validateAndSetFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  }, [validateAndSetFile]);

  const removeImage = useCallback(() => {
    setPreview(null);
    onImageUpload(null);
  }, [onImageUpload]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Face Shot / Avatar (Optional)
      </label>
      
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-border"
          >
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 w-8 h-8"
              onClick={removeImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-32",
              "rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
            )}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileInput}
              className="sr-only"
            />
            <motion.div
              animate={{ y: isDragging ? -5 : 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                {isDragging ? (
                  <ImageIcon className="w-5 h-5 text-primary" />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? "Drop your image here" : "Drop image or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </motion.div>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
