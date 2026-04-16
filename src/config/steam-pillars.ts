export const steamPillarConfig = {
  science: {
    title: 'Science',
    blurb: 'Hands-on experiments and discovery kits that bring biology, chemistry, and physics to life.',
    description:
      'From Green Science eco-experiments to KidzLabs classics, our science toys encourage observation, questioning, and hands-on discovery.',
    image: 'hero-a.jpg',
    productsLabel: 'Science education toys',
    productsPath: 'science-education',
  },
  technology: {
    title: 'Technology',
    blurb: 'Coding, electronics, and robotics toys that introduce how things work in the digital world.',
    description:
      'Robotics, electronics, and coding-friendly kits help children understand how technology is built, programmed, and used in the real world.',
    image: 'hero-b.jpg',
    productsLabel: 'Coding & tech toys',
    productsPath: 'coding-education',
  },
  engineering: {
    title: 'Engineering',
    blurb: 'Build, test, and improve—structures, machines, and systems that teach design thinking.',
    description:
      'Build kits and mechanical projects teach structure, motion, and problem-solving—core habits of young engineers.',
    image: 'hero-c.jpg',
    productsLabel: 'Science & engineering kits',
    productsPath: 'science-education',
  },
  arts: {
    title: 'Arts',
    blurb: 'Creative crafts and maker projects that nurture imagination and self-expression.',
    description:
      'Creative crafts, mould & paint, and maker lines give children space to design, decorate, and express ideas with their hands.',
    image: 'hero-d.jpg',
    productsLabel: 'Creative crafts',
    productsPath: 'creative-crafts',
  },
  mathematics: {
    title: 'Mathematics',
    blurb: 'Logic, patterns, and problem-solving through puzzles and playful challenges.',
    description:
      'Logic puzzles, patterns, and structured play build mathematical thinking—reasoning, sequencing, and spatial skills.',
    image: 'hero-e.jpg',
    productsLabel: 'Coding & logic toys',
    productsPath: 'coding-education',
  },
} as const;

export type SteamPillarSlug = keyof typeof steamPillarConfig;

export function getSteamPillarSlugs(): SteamPillarSlug[] {
  return Object.keys(steamPillarConfig) as SteamPillarSlug[];
}

/** Order used on the STEAM hub page */
export const steamPillarOrder: SteamPillarSlug[] = [
  'science',
  'technology',
  'engineering',
  'arts',
  'mathematics',
];
