// Centralized link configuration used across the landing sections
// Keep defaults conservative and internal-safe. Can be adjusted per deployment.

export type ComparisonLinks = {
  chatgpt: string;
  mas: string;
};

export type AppLinks = {
  comparison: ComparisonLinks;
};

export const links: AppLinks = {
  comparison: {
    // Keep current behavior but make configurable
    chatgpt: '#chatgpt',
    mas: '#get-started',
  },
};
