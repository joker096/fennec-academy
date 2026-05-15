import React from 'react';
import LearningPathMap from '../LearningPathMap';
import { MapPin, Lock } from 'lucide-react';

interface CourseMapProps {
  nodes: {
    id: string;
    x: number;
    y: number;
    label: string;
    topic: string;
    path: string;
    icon: React.ReactNode;
    isUnlocked: boolean;
    isCompleted: boolean;
    isCurrent: boolean;
  }[];
  onNodeClick: (nodeId: string) => void;
  className?: string;
}

export const CourseMap: React.FC<CourseMapProps> = ({
  nodes,
  onNodeClick,
  className,
}) => {
  return (
    <LearningPathMap
      nodes={nodes}
      onNodeClick={onNodeClick}
      className={className || 'h-[250px] md:h-[320px] relative z-10'}
    />
  );
};