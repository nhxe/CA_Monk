
export interface Blog {
  id: number | string;
  title: string;
  category: string[];
  tags?: string[];
  description: string;
  date: string;
  coverImage: string;
  content: string;
  readingTime?: number; // minutes
}

export interface NewBlog {
  title: string;
  category: string[];
  tags?: string[];
  description: string;
  date: string;
  coverImage: string;
  content: string;
}
