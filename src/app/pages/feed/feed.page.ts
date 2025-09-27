import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostService, CreatePostData } from '../../core/services/post.service';
import { LocationService } from '../../core/services/location.service';
import { NotificationService } from '../../core/services/notification.service';
import { PostType } from '../../core/entities/types';
import { LocationType, getCreatorName } from '../../core/entities/location-types';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { WelcomeComponent } from '../../shared/components/welcome/welcome.component';
import { GoogleMapComponent } from '../../shared/components/google-map/google-map.component';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true, 
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule,
    RouterModule,
    FooterComponent, 
    WelcomeComponent,
    GoogleMapComponent
  ]
})
export class FeedPage implements OnInit, OnDestroy {
  posts: PostType[] = [];
  locations: LocationType[] = [];
  filteredLocations: LocationType[] = [];
  loading = false;
  
  // Search functionality
  searchTerm = '';
  
  // New post form
  showCreatePost = false;
  newPost: CreatePostData = {
    title: '',
    content: '',
    image: undefined,
    location: undefined
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private postService: PostService,
    private locationService: LocationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    this.subscriptions.push(
      this.postService.posts$.subscribe(posts => {
        this.posts = posts;
      })
    );

    this.subscriptions.push(
      this.locationService.locations$.subscribe(locations => {
        this.locations = locations;
        this.filteredLocations = locations;
      })
    );

    this.subscriptions.push(
      this.postService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );
  }

  private async loadData() {
    try {
      await Promise.all([
        this.postService.fetchPosts(),
        this.locationService.fetchLocations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      this.notificationService.error('Error al cargar los datos');
    }
  }

  async doRefresh(event: any) {
    try {
      await this.loadData();
    } finally {
      event.target.complete();
    }
  }

  // Search functionality
  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.filteredLocations = this.locations;
      return;
    }

    const lowercaseQuery = this.searchTerm.toLowerCase();
    this.filteredLocations = this.locations.filter(location =>
      location.name.toLowerCase().includes(lowercaseQuery) ||
      location.description.toLowerCase().includes(lowercaseQuery) ||
      location.address.toLowerCase().includes(lowercaseQuery) ||
      (location.sensations && location.sensations.some(sensation =>
        sensation.toLowerCase().includes(lowercaseQuery)
      )) ||
      (location.smells && location.smells.some(smell =>
        smell.toLowerCase().includes(lowercaseQuery)
      ))
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredLocations = this.locations;
  }

  toggleCreatePost() {
    this.showCreatePost = !this.showCreatePost;
    if (!this.showCreatePost) {
      this.resetNewPost();
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.notificationService.error('Por favor selecciona una imagen válida');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('La imagen no puede superar los 5MB');
        return;
      }
      this.newPost.image = file;
    }
  }

  async createPost() {
    if (!this.newPost.title.trim() || !this.newPost.content.trim()) {
      this.notificationService.error('El título y contenido son obligatorios');
      return;
    }

    try {
      await this.postService.createPost(this.newPost);
      this.notificationService.success('Post creado exitosamente');
      this.toggleCreatePost();
    } catch (error) {
      console.error('Error creating post:', error);
      this.notificationService.error('Error al crear el post');
    }
  }

  async likePost(postId: string) {
    try {
      await this.postService.likePost(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      this.notificationService.error('Error al dar like');
    }
  }

  async commentPost(postId: string, content: string) {
    if (!content.trim()) {
      this.notificationService.error('El comentario no puede estar vacío');
      return;
    }

    try {
      await this.postService.commentPost(postId, content);
      this.notificationService.success('Comentario agregado');
    } catch (error) {
      console.error('Error commenting post:', error);
      this.notificationService.error('Error al comentar');
    }
  }

  onLocationSelected(location: LocationType) {
    // Navigate to location detail or show location info
    console.log('Location selected:', location);
    // Could navigate to location detail: this.router.navigate(['/locations', location._id]);
  }

  private resetNewPost() {
    this.newPost = {
      title: '',
      content: '',
      image: undefined,
      location: undefined
    };
  }

  // Utility methods
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getLocationName(locationId?: string): string {
    if (!locationId) return '';
    const location = this.locations.find(loc => loc._id === locationId);
    return location?.name || 'Ubicación desconocida';
  }

  truncateDescription(description: string, maxLength: number = 120): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  // Use the utility function from location-types
  getCreatorName(createdBy: any): string {
    return getCreatorName(createdBy);
  }

  // Remove the processArrayString method since sensations and smells are now proper arraysa
}