import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-card class="post-card">
      <ion-card-header>
        <div class="user-info">
          <ion-avatar>
            <img [src]="post.author?.avatar || 'assets/default-avatar.png'" [alt]="post.author?.name"/>
          </ion-avatar>
          <div class="user-details">
            <ion-card-title>{{ post.author?.name }}</ion-card-title>
            <ion-note>
              <ion-icon name="location"></ion-icon>
              {{ post.location || 'Bogotá' }}
            </ion-note>
          </div>
        </div>
      </ion-card-header>

      <ion-card-content>
        <p>{{ post.content }}</p>
        
        <ion-img 
          *ngIf="post.image" 
          [src]="post.image"
          class="post-image">
        </ion-img>

        <div class="actions-bar">
          <ion-button fill="clear" (click)="onLike()">
            <ion-icon 
              [name]="post.liked ? 'heart' : 'heart-outline'"
              [color]="post.liked ? 'danger' : 'medium'">
            </ion-icon>
            <ion-text>{{ post.likes || 0 }}</ion-text>
          </ion-button>

          <ion-button fill="clear" (click)="showComments = !showComments">
            <ion-icon name="chatbubble-outline"></ion-icon>
            <ion-text>{{ post.comments?.length || 0 }}</ion-text>
          </ion-button>

          <ion-button fill="clear">
            <ion-icon name="share-social-outline"></ion-icon>
          </ion-button>
        </div>

        <div class="comments-section" *ngIf="showComments">
          <ion-list>
            <ion-item *ngFor="let comment of post.comments">
              <ion-avatar slot="start">
                <img [src]="comment.author?.avatar || 'assets/default-avatar.png'" />
              </ion-avatar>
              <ion-label>
                <h3>{{ comment.author?.name }}</h3>
                <p>{{ comment.content }}</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <div class="comment-input">
            <ion-textarea
              [(ngModel)]="newComment"
              placeholder="Escribe un comentario..."
              rows="1">
            </ion-textarea>
            <ion-button fill="clear" (click)="onComment()">
              <ion-icon name="send"></ion-icon>
            </ion-button>
          </div>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styleUrls: ['./post.component.scss']
})
export class PostComponent {
  @Input() post: any;
  @Input() currentUser: any;
  @Output() liked = new EventEmitter<string>();
  @Output() commented = new EventEmitter<{postId: string, comment: string}>();

  showComments = false;
  newComment = '';

  onLike() {
    this.liked.emit(this.post._id);
  }

  onComment() {
    if (this.newComment.trim()) {
      this.commented.emit({
        postId: this.post._id,
        comment: this.newComment
      });
      this.newComment = '';
    }
  }
}
