import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Palette, Briefcase, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StyleCard } from "./StyleCard";
import { ImageUploadZone } from "./ImageUploadZone";

const STYLES = [
  {
    id: "bold",
    name: "Bold & Dramatic",
    description: "High contrast, impactful visuals with strong typography",
    icon: <Zap className="w-5 h-5 text-foreground" />,
    prompt: "bold dramatic high contrast cinematic lighting intense colors impactful"
  },
  {
    id: "minimal",
    name: "Minimal & Clean",
    description: "Simple, elegant design with plenty of white space",
    icon: <Sparkles className="w-5 h-5 text-foreground" />,
    prompt: "minimal clean simple elegant white space modern sophisticated"
  },
  {
    id: "energetic",
    name: "Energetic & Fun",
    description: "Vibrant colors, dynamic elements, playful composition",
    icon: <Palette className="w-5 h-5 text-foreground" />,
    prompt: "energetic fun vibrant colorful dynamic playful exciting pop"
  },
  {
    id: "professional",
    name: "Professional & Trust",
    description: "Credible, authoritative look with refined aesthetics",
    icon: <Briefcase className="w-5 h-5 text-foreground" />,
    prompt: "professional trustworthy credible authoritative refined corporate"
  }
];

interface GeneratorFormProps {
  onGenerate: (data: GeneratorFormData) => void;
  isGenerating: boolean;
}

export interface GeneratorFormData {
  mainText: string;
  contextPrompt: string;
  selectedStyle: string | null;
  youtubeUrl: string;
  uploadedImage: File | null;
}

export function GeneratorForm({ onGenerate, isGenerating }: GeneratorFormProps) {
  const [mainText, setMainText] = useState("");
  const [contextPrompt, setContextPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainText.trim()) return;
    
    onGenerate({
      mainText,
      contextPrompt,
      selectedStyle,
      youtubeUrl,
      uploadedImage
    });
  };

  const selectedStyleData = STYLES.find(s => s.id === selectedStyle);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Main Text Input */}
      <div className="space-y-2">
        <label htmlFor="mainText" className="text-sm font-medium text-foreground">
          Main Thumbnail Text <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="mainText"
          placeholder="Enter the main text for your thumbnail (e.g., 'I Made $10K in 30 Days')"
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          className="min-h-[80px] resize-none bg-card border-border focus:border-primary"
          required
        />
      </div>

      {/* Context Prompt */}
      <div className="space-y-2">
        <label htmlFor="context" className="text-sm font-medium text-foreground">
          Additional Context (Optional)
        </label>
        <Textarea
          id="context"
          placeholder="Describe visual elements you want (e.g., 'a person pointing at the camera, crypto coins floating')"
          value={contextPrompt}
          onChange={(e) => setContextPrompt(e.target.value)}
          className="min-h-[80px] resize-none bg-card border-border focus:border-primary"
        />
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Choose a Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STYLES.map((style) => (
            <StyleCard
              key={style.id}
              name={style.name}
              description={style.description}
              icon={style.icon}
              isSelected={selectedStyle === style.id}
              onClick={() => setSelectedStyle(style.id)}
            />
          ))}
        </div>
      </div>

      {/* YouTube URL Input */}
      <div className="space-y-2">
        <label htmlFor="youtubeUrl" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          YouTube URL for Style Inspiration (Optional)
        </label>
        <Input
          id="youtubeUrl"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="bg-card border-border focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">
          Paste a YouTube URL to inspire the AI with a similar thumbnail style
        </p>
      </div>

      {/* Image Upload */}
      <ImageUploadZone
        onImageUpload={setUploadedImage}
        uploadedImage={uploadedImage}
      />

      {/* Generate Button */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Button
          type="submit"
          disabled={!mainText.trim() || isGenerating}
          className="w-full h-12 text-base font-semibold gradient-forest text-foreground hover:opacity-90 transition-opacity"
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full"
            />
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate 3 Thumbnails
            </>
          )}
        </Button>
      </motion.div>

      {selectedStyleData && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-xs text-muted-foreground text-center"
        >
          Style prompt: "{selectedStyleData.prompt}"
        </motion.p>
      )}
    </motion.form>
  );
}
