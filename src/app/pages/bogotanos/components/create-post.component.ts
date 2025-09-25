import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-card class="create-post-card" (click)="openModal()">
      <ion-card-content>
        <div class="create-post-content">
          <ion-avatar>
            <img [src]="user?.avatar || 'assets/default-avatar.png'" [alt]="user?.name"/>
          </ion-avatar>
          <div class="post-input">
            ¿Qué estás sintiendo en Bogotá?
          </div>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-modal [isOpen]="isModalOpen" (didDismiss)="isModalOpen = false">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Crear nuevo post</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="isModalOpen = false">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <div class="user-info">
            <ion-avatar>
              <img [src]="user?.avatar || 'assets/default-avatar.png'" [alt]="user?.name"/>
            </ion-avatar>
            <div class="user-details">
              <h3>{{ user?.name }}</h3>
              <p>
                <ion-icon name="location"></ion-icon>
                Bogotá, Colombia
              </p>
            </div>
          </div>

          <ion-textarea
            [(ngModel)]="content"
            placeholder="¿Qué estás sintiendo en Bogotá?"
            rows="6">
          </ion-textarea>

          <ion-button 
            expand="block" 
            (click)="createPost()"
            [disabled]="!content.trim()">
            Publicar
          </ion-button>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent {
  @Input() user: any;
  @Output() postCreated = new EventEmitter<any>();

  isModalOpen = false;
  content = '';

  openModal() {
    this.isModalOpen = true;
  }

  createPost() {
    if (this.content.trim()) {
      const post = {
        content: this.content,
        author: this.user,
        createdAt: new Date(),
        likes: 0,
        comments: []
      };
      
      this.postCreated.emit(post);
      this.content = '';
      this.isModalOpen = false;
    }
  }
}
