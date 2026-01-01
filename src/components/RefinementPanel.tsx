import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RefinementPanelProps {
  onRefine: (prompt: string) => void;
  isRefining: boolean;
  selectedThumbnailIndex: number;
}

export function RefinementPanel({ onRefine, isRefining, selectedThumbnailIndex }: RefinementPanelProps) {
  const [refinementPrompt, setRefinementPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementPrompt.trim()) return;
    onRefine(refinementPrompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card border border-border shadow-soft"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-forest flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Refine Your Thumbnail</h3>
          <p className="text-sm text-muted-foreground">
            Refining Option {selectedThumbnailIndex + 1}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Describe how you'd like to refine the selected thumbnail (e.g., 'make the text bigger', 'add more contrast', 'change background to sunset')"
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          className="min-h-[100px] resize-none bg-background border-border focus:border-primary"
        />
        
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            type="submit"
            disabled={!refinementPrompt.trim() || isRefining}
            className="w-full"
            variant="secondary"
          >
            {isRefining ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full"
              />
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Refine Thumbnail
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
