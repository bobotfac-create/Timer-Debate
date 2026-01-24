export interface BackgroundAsset {
  id: string;
  name: string;
  url: string;
  theme: 'general' | 'cyberpunk' | 'steampunk';
}

export const PRESET_BACKGROUNDS: BackgroundAsset[] = [
  {
    id: 'cyber-city',
    name: 'Neon City',
    url: 'https://img.freepik.com/free-vector/gradient-retrowave-grid-background_23-2149020600.jpg',
    theme: 'cyberpunk'
  },
  {
    id: 'cyber-grid',
    name: 'Digital Grid',
    url: 'https://img.freepik.com/free-photo/vivid-blurred-colorful-background_58702-2545.jpg',
    theme: 'cyberpunk'
  },
  {
    id: 'steampunk-map',
    name: 'Old Map',
    url: 'https://img.freepik.com/free-photo/grunge-paint-background_1409-1337.jpg?w=1380',
    theme: 'steampunk'
  },
  {
    id: 'steampunk-gears',
    name: 'Industrial',
    url: 'https://img.freepik.com/free-photo/steampunk-background-with-mechanical-gears_23-2151608249.jpg',
    theme: 'steampunk'
  },
  {
    id: 'modern-abstract',
    name: 'Abstract Dark',
    url: 'https://img.freepik.com/free-photo/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-52379.jpg',
    theme: 'general'
  },
  {
    id: 'modern-clean',
    name: 'Clean Slate',
    url: 'https://img.freepik.com/free-photo/smooth-gray-background_53876-108459.jpg',
    theme: 'general'
  }
];