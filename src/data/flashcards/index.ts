import { ES_OFFLINE_EXAMPLES } from './es';
import { FR_OFFLINE_EXAMPLES } from './fr';
import { DE_OFFLINE_EXAMPLES } from './de';
import { IT_OFFLINE_EXAMPLES } from './it';
import { JA_OFFLINE_EXAMPLES } from './ja';
import { ZH_OFFLINE_EXAMPLES } from './zh';
import { SR_OFFLINE_EXAMPLES } from './sr';
import { ContextualExample } from '../../services/geminiService';

export const OFFLINE_EXAMPLES: Record<string, Record<number, ContextualExample[]>> = {
  es: ES_OFFLINE_EXAMPLES,
  fr: FR_OFFLINE_EXAMPLES,
  de: DE_OFFLINE_EXAMPLES,
  it: IT_OFFLINE_EXAMPLES,
  ja: JA_OFFLINE_EXAMPLES,
  zh: ZH_OFFLINE_EXAMPLES,
  sr: SR_OFFLINE_EXAMPLES,
};
