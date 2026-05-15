import React, { useMemo } from 'react';
import { SRSFlashcard } from '../SRSFlashcard';

interface SRSFlashcardContainerProps {
  nextDueWord: any;
  onComplete: () => void;
  sessionCompleted: boolean;
}

export const SRSFlashcardContainer: React.FC<SRSFlashcardContainerProps> = ({
  nextDueWord,
  onComplete,
  sessionCompleted,
}) => {
  if (!nextDueWord || sessionCompleted) return null;

  return (
    <SRSFlashcard
      word={nextDueWord}
      onComplete={onComplete}
    />
  );
};