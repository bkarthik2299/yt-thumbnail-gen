import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThumbnailGridProps {
  thumbnails: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  isLoading?: boolean;
}

export function ThumbnailGrid({ thumbnails, selectedIndex, onSelect, isLoading }: ThumbnailGridProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDownload = async (url: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `thumbnail-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleExpand = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(url);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="aspect-video rounded-xl overflow-hidden bg-secondary relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-muted to-secondary animate-shimmer" 
                 style={{ backgroundSize: "200% 100%" }} />
          </motion.div>
        ))}
      </div>
    );
  }

  if (thumbnails.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Generated Thumbnails</h2>
        <p className="text-sm text-muted-foreground">Click to select a thumbnail for refinement</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {thumbnails.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              {/* Image container */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelect(index)}
                className={cn(
                  "relative aspect-video rounded-xl overflow-hidden cursor-pointer",
                  "border-2 transition-all duration-300 shadow-soft hover:shadow-card",
                  selectedIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                <img
                  src={url}
                  alt={`Thumbnail option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Selection indicator */}
                {selectedIndex === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </motion.div>
                )}
                
                {/* Option number */}
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-foreground/80 text-primary-foreground text-xs font-medium">
                  Option {index + 1}
                </div>
              </motion.div>

              {/* Action buttons below image */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => handleExpand(url, e)}
                  className="h-8 w-8 hover:bg-secondary"
                  title="Preview full size"
                >
                  <Expand className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => handleDownload(url, index, e)}
                  className="h-8 w-8 hover:bg-secondary"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full-size preview modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 h-10 w-10"
              >
                <X className="w-5 h-5" />
              </Button>
              <img
                src={previewImage}
                alt="Full size preview"
                className="w-full h-auto rounded-xl shadow-card"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
