import { Award, Flame, Zap, BookOpen, Star, Coins, Heart, Shield, Target, MessageSquare } from 'lucide-react';
import React from 'react';

export interface AchievementTier {
  level: number;
  requirement: number;
  label: string;
}

export interface Achievement {
  id: string;
  icon: React.ReactNode;
  color: string;
  tiers: AchievementTier[];
  type: 'streak' | 'xp' | 'words' | 'lessons' | 'examples' | 'perfect_lessons' | 'level' | 'credits' | 'special';
  stat?: string; // For special stats
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'wildfire',
    icon: <Flame className="w-6 h-6" />,
    color: 'text-orange-500',
    type: 'streak',
    tiers: [
      { level: 1, requirement: 3, label: '3 Day Streak' },
      { level: 2, requirement: 7, label: '7 Day Streak' },
      { level: 3, requirement: 14, label: '14 Day Streak' },
      { level: 4, requirement: 30, label: '30 Day Streak' },
      { level: 5, requirement: 100, label: '100 Day Streak' },
    ]
  },
  {
    id: 'sage',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-indigo-500',
    type: 'xp',
    tiers: [
      { level: 1, requirement: 500, label: '500 XP' },
      { level: 2, requirement: 1000, label: '1,000 XP' },
      { level: 3, requirement: 5000, label: '5,000 XP' },
      { level: 4, requirement: 10000, label: '10,000 XP' },
      { level: 5, requirement: 50000, label: '50,000 XP' },
    ]
  },
  {
    id: 'scholar',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-emerald-500',
    type: 'words',
    tiers: [
      { level: 1, requirement: 50, label: '50 Words Mastered' },
      { level: 2, requirement: 100, label: '100 Words Mastered' },
      { level: 3, requirement: 250, label: '250 Words Mastered' },
      { level: 4, requirement: 500, label: '500 Words Mastered' },
      { level: 5, requirement: 1000, label: '1,000 Words Mastered' },
    ]
  },
  {
    id: 'ach_dean',
    icon: <Award className="w-6 h-6" />,
    color: 'text-blue-500',
    type: 'lessons',
    tiers: [
      { level: 1, requirement: 5, label: '5 Lessons Completed' },
      { level: 2, requirement: 10, label: '10 Lessons Completed' },
      { level: 3, requirement: 25, label: '25 Lessons Completed' },
      { level: 4, requirement: 50, label: '50 Lessons Completed' },
      { level: 5, requirement: 100, label: '100 Lessons Completed' },
    ]
  },
  {
    id: 'ach_researcher',
    icon: <Target className="w-6 h-6" />,
    color: 'text-amber-500',
    type: 'examples',
    tiers: [
      { level: 1, requirement: 10, label: '10 Examples Saved' },
      { level: 2, requirement: 25, label: '25 Examples Saved' },
      { level: 3, requirement: 50, label: '50 Examples Saved' },
      { level: 4, requirement: 100, label: '100 Examples Saved' },
      { level: 5, requirement: 250, label: '250 Examples Saved' },
    ]
  },
  {
    id: 'sharpshooter',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-rose-500',
    type: 'perfect_lessons',
    tiers: [
      { level: 1, requirement: 1, label: '1 Perfect Lesson' },
      { level: 2, requirement: 5, label: '5 Perfect Lessons' },
      { level: 3, requirement: 10, label: '10 Perfect Lessons' },
      { level: 4, requirement: 25, label: '25 Perfect Lessons' },
      { level: 5, requirement: 50, label: '50 Perfect Lessons' },
    ]
  },
  {
    id: 'merchant',
    icon: <Coins className="w-6 h-6" />,
    color: 'text-yellow-500',
    type: 'credits',
    tiers: [
      { level: 1, requirement: 100, label: '100 Credits' },
      { level: 2, requirement: 500, label: '500 Credits' },
      { level: 3, requirement: 1000, label: '1,000 Credits' },
      { level: 4, requirement: 5000, label: '5,000 Credits' },
      { level: 5, requirement: 10000, label: '10,000 Credits' },
    ]
  },
  {
    id: 'legend',
    icon: <Star className="w-6 h-6" />,
    color: 'text-purple-500',
    type: 'level',
    tiers: [
      { level: 1, requirement: 5, label: 'Level 5' },
      { level: 2, requirement: 10, label: 'Level 10' },
      { level: 3, requirement: 25, label: 'Level 25' },
      { level: 4, requirement: 50, label: 'Level 50' },
      { level: 5, requirement: 100, label: 'Level 100' },
    ]
  }
];
