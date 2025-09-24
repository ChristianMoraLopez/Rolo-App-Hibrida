import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface ActivityData {
  date: string;
  users: number;
  locations: number;
  comments: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalLocations: number;
  totalPosts: number;
  totalComments: number;
  recentActivity: ActivityData[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Parallel requests like in React version
      const [usersObservable, locationsObservable, postsObservable] = await Promise.all([
        this.apiService.get<any[]>('/users'),
        this.apiService.get<any[]>('/locations'),
        this.apiService.get<any[]>('/posts')
      ]);

      return new Promise((resolve, reject) => {
        let users: any[] = [];
        let locations: any[] = [];
        let posts: any[] = [];
        let completedRequests = 0;

        const checkCompletion = () => {
          completedRequests++;
          if (completedRequests === 3) {
            // Validate data types
            if (!Array.isArray(users) || !Array.isArray(locations) || !Array.isArray(posts)) {
              reject(new Error('Invalid data format received from API'));
              return;
            }

            const totalComments = posts.reduce<number>(
              (total, post) => total + (post.comments?.length || 0),
              0
            );

            const recentActivity: ActivityData[] = [
              {
                date: new Date().toLocaleDateString('es-CO'),
                users: Math.max(1, Math.floor(users.length * 0.1)),
                locations: Math.max(1, Math.floor(locations.length * 0.1)),
                comments: Math.max(1, Math.floor(totalComments * 0.1))
              }
            ];

            resolve({
              totalUsers: users.length,
              activeUsers: Math.floor(users.length * 0.75),
              totalLocations: locations.length,
              totalPosts: posts.length,
              totalComments,
              recentActivity
            });
          }
        };

        usersObservable.subscribe({
          next: (data) => { users = data; },
          error: (error) => reject(new Error('Error fetching users')),
          complete: checkCompletion
        });

        locationsObservable.subscribe({
          next: (data) => { locations = data; },
          error: (error) => reject(new Error('Error fetching locations')),
          complete: checkCompletion
        });

        postsObservable.subscribe({
          next: (data) => { posts = data; },
          error: (error) => reject(new Error('Error fetching posts')),
          complete: checkCompletion
        });
      });

    } catch (error) {
      console.error('Dashboard service error:', error);
      
      // Return default values like in React version
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalLocations: 0,
        totalPosts: 0,
        totalComments: 0,
        recentActivity: []
      };
    }
  }
}
