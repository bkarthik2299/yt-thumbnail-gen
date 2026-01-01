import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StyleCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export function StyleCard({ name, description, icon, isSelected, onClick }: StyleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300",
        "bg-card shadow-soft hover:shadow-card",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border/50 hover:border-primary/50"
      )}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          isSelected ? "gradient-forest" : "bg-secondary"
        )}>
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
