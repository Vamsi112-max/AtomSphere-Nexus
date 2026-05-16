"use client";

import { motion } from "framer-motion";
import { getColorByProgress } from "@/lib/progress";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  label,
  sublabel
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const colorClass = getColorByProgress(progress);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }} className="relative drop-shadow-xl">
        <svg
          className="transform -rotate-90 w-full h-full"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-white/5"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={colorClass}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass.split(' ')[0]}`}>
            {progress}%
          </span>
        </div>
      </div>
      {(label || sublabel) && (
        <div className="text-center mt-4">
          {label && <p className="font-semibold text-sm text-primary">{label}</p>}
          {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
