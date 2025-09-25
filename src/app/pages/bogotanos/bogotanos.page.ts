import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PostComponent } from './components/post.component';
import { CreatePostComponent } from './components/create-post.component';
import { PostService } from '@services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bogotanos',
  template: `
    <ion-content>
      <div class="ion-padding-horizontal">
        <!-- Create Post Card -->
        <app-create-post 
          [user]="user$ | async"
          (postCreated)="handlePostCreated($event)">
        </app-create-post>

        <!-- Segments -->
        <ion-segment [(ngModel)]="selectedSegment" class="custom-segment">
          <ion-segment-button value="todos">
            <ion-label>Todos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="siguiendo">
            <ion-label>Siguiendo</ion-label>
          </ion-segment-button>
          <ion-segment-button value="populares">
            <ion-label>Populares</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Posts List -->
        <div class="posts-container">
          <ng-container [ngSwitch]="selectedSegment">
            <ng-container *ngSwitchCase="'todos'">
              <app-post 
                *ngFor="let post of posts"
                [post]="post"
                [currentUser]="user$ | async"
                (liked)="handlePostLiked($event)"
                (commented)="handlePostCommented($event)">
              </app-post>
            </ng-container>

            <ng-container *ngSwitchCase="'siguiendo'">
              <div class="empty-state">
                <ion-icon name="people"></ion-icon>
                <h3>Aún no sigues a nadie</h3>
                <p>¡Encuentra personas con intereses similares!</p>
                <ion-button>Explorar perfiles</ion-button>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'populares'">
              <app-post 
                *ngFor="let post of popularPosts"
                [post]="post"
                [currentUser]="user$ | async"
                (liked)="handlePostLiked($event)"
                (commented)="handlePostCommented($event)">
              </app-post>
            </ng-container>
          </ng-container>
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['./bogotanos.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule,
    FormsModule,
    PostComponent,
    CreatePostComponent
  ]
})
export class BogotanosPage implements OnInit {
  selectedSegment = 'todos';
  posts: any[] = [];
  user$ = this.authService.user$;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  get popularPosts() {
    return [...this.posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  async loadPosts() {
    try {
      this.posts = await this.postService.getPosts();
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  handlePostCreated(post: any) {
    this.posts = [post, ...this.posts];
  }

  handlePostLiked(postId: string) {
    // Update post likes
  }

  handlePostCommented(data: {postId: string, comment: string}) {
    // Add comment to post
  }
}
