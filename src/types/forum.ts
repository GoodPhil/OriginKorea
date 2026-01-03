// Forum Types

export interface ForumCategory {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  description_ko: string | null;
  description_en: string | null;
  icon: string;
  color: string;
  order_num: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  post_count?: number;
}

export interface ForumPost {
  id: string;
  category_id: string;
  author_id: string | null;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: ForumCategory;
  author?: {
    id: string;
    display_name: string | null;
    email: string;
  };
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string | null;
  parent_id: string | null;
  content: string;
  like_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: {
    id: string;
    display_name: string | null;
    email: string;
  };
  is_liked?: boolean;
  replies?: ForumComment[];
}

export interface ForumLike {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  created_at: string;
}

export interface ForumBookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

// API Request/Response Types
export interface CreatePostRequest {
  category_id: string;
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
}

export interface CreateCommentRequest {
  post_id: string;
  parent_id?: string;
  content: string;
}

export interface ForumPostsResponse {
  posts: ForumPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ForumCategoriesResponse {
  categories: ForumCategory[];
}
