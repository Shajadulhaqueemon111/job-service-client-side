import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showScore?: boolean;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showScore = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const effectiveRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = effectiveRating >= starValue;
          const isHalf = !isFilled && effectiveRating >= starValue - 0.5;

          return (
            <button
              key={i}
              type={interactive ? "button" : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                "transition-transform",
                interactive ? "cursor-pointer hover:scale-125 focus:outline-none" : "cursor-default"
              )}
            >
              {isFilled ? (
                <Star className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")} />
              ) : isHalf ? (
                <StarHalf className={cn(sizeClasses[size], "fill-amber-400 text-amber-400")} />
              ) : (
                <Star className={cn(sizeClasses[size], "text-slate-300 dark:text-slate-700")} />
              )}
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 ml-1">
          {rating ? rating.toFixed(1) : "0.0"}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
