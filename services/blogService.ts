
import { Blog, NewBlog } from '../types';

const API_BASE = 'http://localhost:3001';
const FALLBACK_KEY = 'the_curator_v2_storage';

// Helper to simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate estimated reading time
const calculateReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const getInitialData = (): Blog[] => [
  {
    id: "1",
    title: "The Silent Geometry of Brutalism",
    category: ["ARCHITECTURE"],
    tags: ["Brutalism", "Concrete", "Urbanism"],
    description: "An investigation into the raw honesty of exposed concrete and the architectural souls of monolithic structures.",
    date: "2026-02-15T10:00:00.000Z",
    coverImage: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2000&auto=format&fit=crop",
    content: "There is a specific kind of beauty in the unapologetic weight of concrete. Brutalism, often misunderstood as cold or hostile, is in fact an architecture of profound honesty. It does not hide its structural purpose behind glass curtains or decorative facades.\n\nIn this entry, we explore the works of Marcel Breuer and Le Corbusier, looking at how they used the 'béton brut' to create spaces that feel both ancient and futuristic. The way light hits a textured concrete wall at sunset reveals a softness that few other materials can replicate. It is the architecture of the soul, stripped of all pretense.",
    readingTime: 4
  },
  {
    id: "2",
    title: "The Ethics of Digital Minimalism",
    category: ["PHILOSOPHY"],
    tags: ["Minimalism", "Technology", "Mindfulness"],
    description: "In an era of infinite noise, the most radical act is the intentional curation of one's digital landscape.",
    date: "2026-01-20T14:30:00.000Z",
    coverImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2000&auto=format&fit=crop",
    content: "Digital minimalism is not about living in a cave; it is about reclaiming the agency over our attention. The modern interface is designed to exploit our biological weaknesses, turning focus into a commodity. \n\nWe must build our own 'architectural' boundaries in the digital realm. This means choosing tools that serve us, rather than the other way around. It requires a philosophy of 'less but better', where every notification is a conscious choice and every app has a verified purpose. Silence in the digital age is not a luxury—it is a necessity for deep thought.",
    readingTime: 6
  }
];

const getLocalBlogs = (): Blog[] => {
  if (typeof window === 'undefined') return getInitialData();
  try {
    const stored = localStorage.getItem(FALLBACK_KEY);
    if (stored) return JSON.parse(stored);
    const initial = getInitialData();
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(initial));
    return initial;
  } catch (e) {
    console.error("Local storage error:", e);
    return getInitialData();
  }
};

export const fetchBlogs = async (): Promise<Blog[]> => {
  await sleep(600); // Simulate network
  try {
    const res = await fetch(`${API_BASE}/blogs`);
    if (!res.ok) throw new Error('API down');
    return await res.json();
  } catch (err) {
    return getLocalBlogs();
  }
};

export const fetchBlogById = async (id: string | number): Promise<Blog> => {
  await sleep(400); // Simulate network
  try {
    const res = await fetch(`${API_BASE}/blogs/${id}`);
    if (!res.ok) throw new Error('Not found');
    return await res.json();
  } catch (err) {
    const blogs = getLocalBlogs();
    const found = blogs.find(b => String(b.id) === String(id));
    if (!found) throw new Error('Entry missing from archives');
    return found;
  }
};

export const createBlog = async (newBlog: NewBlog): Promise<Blog> => {
  await sleep(1000); // Simulate upload
  const blogWithMeta: Blog = {
    ...newBlog,
    id: Date.now().toString(),
    readingTime: calculateReadingTime(newBlog.content)
  };

  try {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogWithMeta),
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (err) {
    const blogs = getLocalBlogs();
    const updated = [blogWithMeta, ...blogs];
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Storage save failed");
    }
    return blogWithMeta;
  }
};
