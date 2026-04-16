export interface Award {
  name: string;
  program: string;
  institution: string;
  year: string;
  media_source: 'file' | 'url' | 'vimeo' | 'wistia';
  media_destination: string;
  featured: boolean;
}
