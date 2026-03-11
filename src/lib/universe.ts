import { ThemeUniverse } from '@/content/types';

export const universeMeta: Record<ThemeUniverse, { label: string; shortLabel: string; description: string }> = {
  professional: {
    label: 'Technology & Innovation',
    shortLabel: 'Technology & Innovation',
    description:
      'Explore new and emerging technologies such as AI, cybersecurity, OT/ICS, IoT/IIoT, blockchain, quantum computing, and more, through simple and accessible insights.',
  },
  personal: {
    label: 'Curiosities & Philosophy',
    shortLabel: 'Curiosities & Philosophy',
    description:
      'Discover topics such as philosophy, anime, books, hobbies, and science, explored through curiosity, creativity, and thoughtful reflection.',
  },
};

const professionalAliases = ['professional', 'technology', 'technology & innovation', 'technology and innovation'];
const personalAliases = ['personal', 'curiosities', 'curiosities & philosophy', 'curiosities and philosophy'];

export function normalizeUniverse(value?: string | null): ThemeUniverse | '' {
  const norm = (value || '').toLowerCase().trim();
  if (!norm) return '';
  if (professionalAliases.some((alias) => norm === alias || norm.startsWith(alias))) return 'professional';
  if (personalAliases.some((alias) => norm === alias || norm.startsWith(alias))) return 'personal';
  return '';
}

export function universeLabel(value?: string | null) {
  const normalized = normalizeUniverse(value);
  return normalized ? universeMeta[normalized].label : 'Unknown universe';
}
