import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GeneratorForm, GeneratorFormData } from "@/components/GeneratorForm";
import { ThumbnailGrid } from "@/components/ThumbnailGrid";
import { RefinementPanel } from "@/components/RefinementPanel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STYLES_MAP: Record<string, string> = {
  bold: "bold dramatic high contrast cinematic lighting intense colors impactful",
  minimal: "minimal clean simple elegant white space modern sophisticated",
  energetic: "energetic fun vibrant colorful dynamic playful exciting pop",
  professional: "professional trustworthy credible authoritative refined corporate"
};

const Index = () => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [lastFormData, setLastFormData] = useState<GeneratorFormData | null>(null);
  const { toast } = useToast();

  const pollForCompletion = async (predictionId: string): Promise<string[]> => {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: { predictionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Poll response:", data);

      if (data.status === "succeeded") {
        return Array.isArray(data.output) ? data.output : [data.output];
      }

      if (data.status === "failed") {
        throw new Error(data.error || "Thumbnail generation failed");
      }

      if (data.status === "canceled") {
        throw new Error("Generation was canceled");
      }

      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error("Generation timed out");
  };

  const generateThumbnails = async (data: GeneratorFormData) => {
    setIsGenerating(true);
    setThumbnails([]);
    setSelectedThumbnailIndex(null);
    setLastFormData(data);

    try {
      // Build the prompt
      const stylePrompt = data.selectedStyle ? STYLES_MAP[data.selectedStyle] || "" : "";
      const fullPrompt = [
        `YouTube thumbnail with text "${data.mainText}"`,
        stylePrompt,
        data.contextPrompt,
        data.youtubeUrl ? `inspired by video style from ${data.youtubeUrl}` : "",
        "16:9 aspect ratio, high quality, professional YouTube thumbnail"
      ].filter(Boolean).join(", ");

      console.log("Full prompt:", fullPrompt);

      // Start the prediction
      const { data: prediction, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: { prompt: fullPrompt, numOutputs: 3 }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (prediction.error) {
        throw new Error(prediction.error);
      }

      console.log("Prediction started:", prediction);

      // Poll for completion
      const outputUrls = await pollForCompletion(prediction.id);
      setThumbnails(outputUrls);

      toast({
        title: "Thumbnails Generated!",
        description: "Click on a thumbnail to select it for refinement.",
      });

    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const refineThumbnail = async (prompt: string) => {
    if (selectedThumbnailIndex === null || !lastFormData) return;
    
    setIsRefining(true);

    try {
      // Build refinement prompt
      const refinementPrompt = [
        `Refine YouTube thumbnail: ${prompt}`,
        `Original text: "${lastFormData.mainText}"`,
        lastFormData.contextPrompt,
        "16:9 aspect ratio, high quality, professional YouTube thumbnail"
      ].filter(Boolean).join(", ");

      console.log("Refinement prompt:", refinementPrompt);

      // Start the prediction
      const { data: prediction, error } = await supabase.functions.invoke("generate-thumbnail", {
        body: { prompt: refinementPrompt, numOutputs: 3 }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (prediction.error) {
        throw new Error(prediction.error);
      }

      // Poll for completion
      const outputUrls = await pollForCompletion(prediction.id);
      setThumbnails(outputUrls);
      setSelectedThumbnailIndex(null);

      toast({
        title: "Refinement Complete!",
        description: "New thumbnail options have been generated.",
      });

    } catch (error) {
      console.error("Refinement error:", error);
      toast({
        title: "Refinement Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mist">
      <div className="container max-w-5xl py-12 px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            YouTube Thumbnail Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create eye-catching thumbnails that boost your click-through rate. 
            Powered by AI to generate stunning visuals in seconds.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Generator Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
              <GeneratorForm
                onGenerate={generateThumbnails}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {(isGenerating || thumbnails.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 rounded-2xl bg-card border border-border shadow-soft"
                >
                  <ThumbnailGrid
                    thumbnails={thumbnails}
                    selectedIndex={selectedThumbnailIndex}
                    onSelect={setSelectedThumbnailIndex}
                    isLoading={isGenerating}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedThumbnailIndex !== null && thumbnails.length > 0 && (
                <RefinementPanel
                  onRefine={refineThumbnail}
                  isRefining={isRefining}
                  selectedThumbnailIndex={selectedThumbnailIndex}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Generate 3 unique thumbnail options • 16:9 aspect ratio • Download instantly
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
