export const DASHBOARD_HERO_ILLUSTRATIONS = {
  learner: '/Learning-bro.svg',
  lecturer: '/Mathematics-bro.svg',
  admin: '/Admin-cuate.svg',
} as const;

export type DashboardHeroIllustrationKey = keyof typeof DASHBOARD_HERO_ILLUSTRATIONS;
