import { useState, useMemo } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  username: string;
}

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  images?: string[];
  timestamp: string;
  saved: boolean;
  comment: any[];
  user: User;
}

const useMainController = () => {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [menuOptions, setMenuOptions] = useState<any>([]);
  const [currentButtonLabel, setCurrentButtonLabel] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'title' | 'username' | 'date' | 'all'>('all');

  const handleClick = (event: any, options: any, label: any) => {
    setAnchorEl(event.currentTarget);
    setMenuOptions(options);
    setCurrentButtonLabel(label);
  };

  const handleClose = (option: any) => {
    setSelectedOptions((prevSelectedOptions: any) => ({
      ...prevSelectedOptions,
      [currentButtonLabel]: option,
    }));
    setAnchorEl(null);
  };

  // Search function
  const searchPosts = (posts: Post[], query: string, type: string = 'all') => {
    if (!query.trim()) return posts;

    const lowercaseQuery = query.toLowerCase().trim();

    return posts.filter((post) => {
      switch (type) {
        case 'title':
          return post.title.toLowerCase().includes(lowercaseQuery);
        
        case 'username':
          const fullName = `${post.user.firstName} ${post.user.lastName}`.toLowerCase();
          const username = post.user.username.toLowerCase();
          return fullName.includes(lowercaseQuery) || username.includes(lowercaseQuery);
        
        case 'date':
          // Search by date (format: YYYY-MM-DD or partial matches)
          const createdDate = new Date(post.createdAt).toLocaleDateString();
          const createdDateISO = new Date(post.createdAt).toISOString().split('T')[0];
          return createdDate.includes(lowercaseQuery) || createdDateISO.includes(lowercaseQuery);
        
        case 'all':
        default:
          // Search in title, username, and date
          const titleMatch = post.title.toLowerCase().includes(lowercaseQuery);
          const userMatch = 
            `${post.user.firstName} ${post.user.lastName}`.toLowerCase().includes(lowercaseQuery) ||
            post.user.username.toLowerCase().includes(lowercaseQuery);
          const dateMatch = 
            new Date(post.createdAt).toLocaleDateString().includes(lowercaseQuery) ||
            new Date(post.createdAt).toISOString().split('T')[0].includes(lowercaseQuery);
          
          return titleMatch || userMatch || dateMatch;
      }
    });
  };

  // Memoized filtered posts function
  const getFilteredPosts = useMemo(() => {
    return (posts: Post[]) => searchPosts(posts, searchQuery, searchType);
  }, [searchQuery, searchType]);

  // Helper function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 4px;">$1</mark>');
  };

  // Reset search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchType('all');
  };

  return {
    // Original controller methods
    menuOptions,
    currentButtonLabel,
    selectedOptions,
    anchorEl,
    setAnchorEl,
    setMenuOptions,
    setCurrentButtonLabel,
    handleClick,
    handleClose,
    
    // Search functionality
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchPosts,
    getFilteredPosts,
    highlightSearchTerm,
    clearSearch,
  };
};

export default useMainController;