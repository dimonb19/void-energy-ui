interface StoryData {
  title: string;
  href: string;
  author: { name: string; avatar?: string; href?: string };
  genres: string[];
  image: string;
  mark?: 'resume' | 'complete' | 'replay';
  gated?: boolean;
}

interface CategoryDef {
  id: string;
  title: string;
  tagline: string;
  stories: StoryData[];
}
