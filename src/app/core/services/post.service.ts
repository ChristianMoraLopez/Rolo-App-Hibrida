import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PostType } from '../entities/types';

export interface CreatePostData {
  title: string;
  content: string;
  image?: File;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsSubject = new BehaviorSubject<PostType[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public posts$ = this.postsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialPosts();
  }

  private async loadInitialPosts(): Promise<void> {
    await this.fetchPosts();
  }

  async fetchPosts(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const observable = await this.apiService.get<PostType[]>('/posts');
      observable.subscribe({
        next: (posts) => {
          this.postsSubject.next(posts);
        },
        error: (error) => {
          console.error('Error fetching posts:', error);
          throw error;
        },
        complete: () => {
          this.loadingSubject.next(false);
        }
      });
    } catch (error) {
      this.loadingSubject.next(false);
      throw error;
    }
  }

  async createPost(postData: CreatePostData): Promise<PostType> {
    this.loadingSubject.next(true);
    
    try {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      
      if (postData.image) {
        formData.append('image', postData.image);
      }
      
      if (postData.location) {
        formData.append('location', postData.location);
      }

      // Use direct HTTP call for FormData
    const token = await this.getAuthToken();
    const response = await fetch('https://backend-ypgb6g.fly.dev/api/posts', {
        method: 'POST',
        headers: {
      'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error creating post');
      }

      const newPost: PostType = await response.json();
      
      // Update posts list
      const currentPosts = this.postsSubject.value;
      this.postsSubject.next([newPost, ...currentPosts]);
      
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async commentPost(postId: string, content: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
  const observable = await this.apiService.post(`/posts/${postId}/comment`, { content });
      observable.subscribe({
        next: () => {
          // Refresh posts to show new comment
          this.fetchPosts();
        },
        error: (error) => {
          console.error('Error commenting post:', error);
          throw error;
        },
        complete: () => {
          this.loadingSubject.next(false);
        }
      });
    } catch (error) {
      this.loadingSubject.next(false);
      throw error;
    }
  }

  async likePost(postId: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
  const observable = await this.apiService.post(`/posts/${postId}/like`, {});
      observable.subscribe({
        next: () => {
          // Update the specific post in the list
          const currentPosts = this.postsSubject.value;
          const updatedPosts = currentPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
                liked: !post.liked
              };
            }
            return post;
          });
          this.postsSubject.next(updatedPosts);
        },
        error: (error) => {
          console.error('Error liking post:', error);
          throw error;
        },
        complete: () => {
          this.loadingSubject.next(false);
        }
      });
    } catch (error) {
      this.loadingSubject.next(false);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  // Utility methods
  getPosts(): PostType[] {
    return this.postsSubject.value;
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
