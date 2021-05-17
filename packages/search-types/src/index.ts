export interface RelatedTag {
  query: string;
  tag: string;
}

export interface Result {
  id: string;
  title: string;
  images: string[];
}

export interface Suggestion {
  query: string;
}
