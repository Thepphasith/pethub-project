
import axios from 'axios';

// Blog post interface from the API
export interface BlogPost {
  id: string;
  userId: string;
  title: string;
  body: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Blog post interface for the UI component
export interface UiBlogPost {
  id: number;
  username: string; // We'll use userId until we have user data
  timestamp: string;
  title: string;
  content: string;
  image?: string;
  votes: number; // Default value
  comments: number; // Default value
  userVote: "up" | "down" | null;
  saved: boolean;
}

// API base URL - should come from env in real apps
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Format date to relative time (e.g. "5 hours ago")
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
};

// Transform API BlogPost to UiBlogPost format
const transformBlogPost = (post: BlogPost): UiBlogPost => {
  return {
    id: parseInt(post.id), // Convert string ID to number
    username: `user_${post.userId.substring(0, 5)}`, // Create temporary username from userId
    timestamp: formatRelativeTime(post.createdAt),
    title: post.title,
    content: post.body,
    image: post.images.length > 0 ? post.images[0] : undefined,
    votes: Math.floor(Math.random() * 1000) + 1, // Random votes for demo
    comments: Math.floor(Math.random() * 100), // Random comments for demo
    userVote: null, // Default no vote
    saved: false, // Default not saved
  };
};

// Blog service object with all API functions
const blogService = {
  // Get all blog posts
  getAllPosts: async (): Promise<UiBlogPost[]> => {
    try {
      const response = await apiClient.get<BlogPost[]>('/blog');
      return response.data
        .filter(post => post.isActive) // Only return active posts
        .map(transformBlogPost);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },
  
  // Get a single blog post by ID
  getPostById: async (id: string): Promise<UiBlogPost> => {
    try {
      const response = await apiClient.get<BlogPost>(`/blog/${id}`);
      return transformBlogPost(response.data);
    } catch (error) {
      console.error(`Error fetching blog post with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new blog post
  createPost: async (newPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> => {
    try {
      const response = await apiClient.post<BlogPost>('/blog', newPost);
      return response.data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  },
  
  // Update an existing blog post
  updatePost: async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
    try {
      const response = await apiClient.put<BlogPost>(`/blog/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating blog post with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a blog post
  deletePost: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/blog/${id}`);
    } catch (error) {
      console.error(`Error deleting blog post with ID ${id}:`, error);
      throw error;
    }
  }
};

export default blogService;