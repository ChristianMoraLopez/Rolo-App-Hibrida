import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationService } from '../../../core/services/location.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LocationType, getCreatorName } from '../../../core/entities/location-types';
import { GoogleMapsModule } from '@angular/google-maps';
import { GoogleMapComponent } from '../../../shared/components/google-map/google-map.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, GoogleMapsModule, GoogleMapComponent]
})
export class ExplorePage implements OnInit, OnDestroy {
  locations: LocationType[] = [];
  filteredLocations: LocationType[] = [];
  loading = false;
  searchTerm = '';
  selectedSensations: string[] = [];
  selectedSmells: string[] = [];
  availableSensations = ['Tranquilo', 'Energético', 'Nostálgico', 'Inspirador', 'Relajante'];
  availableSmells = ['Café', 'Flores', 'Comida', 'Naturaleza', 'Urbano'];
  apiLoaded = false;
  apiLoadError: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private locationService: LocationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadGoogleMaps();
    this.setupSubscriptions();
    this.loadLocations();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async loadGoogleMaps() {
    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Error cargando Google Maps'));
      });
      this.apiLoaded = true;
      console.log('Google Maps API loaded successfully in ExplorePage');
    } catch (error) {
      this.apiLoadError = 'Error cargando Google Maps. Verifica tu configuración.';
      console.error('Google Maps load error in ExplorePage:', error);
      this.apiLoaded = false;
      this.notificationService.error('Error al cargar el mapa');
    }
  }

  private setupSubscriptions() {
    this.subscriptions.push(
      this.locationService.locations$.subscribe(locations => {
        // Transformar las URLs de las imágenes si son relativas
        this.locations = locations.map(location => ({
          ...location,
          images: location.images?.map(image => ({
            ...image,
            src: this.getFullImageUrl(image.src)
          })) || []
        }));
        this.filterLocations();
        console.log('Locations:', this.locations);
        console.log('Filtered Locations:', this.filteredLocations);
      })
    );

    this.subscriptions.push(
      this.locationService.loading$.subscribe(loading => {
        this.loading = loading;
        console.log('Loading:', loading);
      })
    );
  }

  private getFullImageUrl(src: string): string {
    // Validar que src sea una cadena válida
    if (!src || typeof src !== 'string') {
      console.warn('Invalid image src:', src);
      return 'assets/images/placeholder.png'; // Imagen por defecto
    }
    // Si la URL ya es absoluta, devolverla tal cual
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    // Añadir la URL base del servidor
    return `${environment.apiUrl}${src.startsWith('/') ? '' : '/'}${src}`;
  }

  private async loadLocations() {
    try {
      await this.locationService.fetchLocations();
    } catch (error) {
      console.error('Error loading locations:', error);
      this.notificationService.error('Error al cargar las ubicaciones');
    }
  }

  async doRefresh(event: any) {
    try {
      await this.loadLocations();
    } finally {
      event.target.complete();
    }
  }

  onSearchChange() {
    this.filterLocations();
  }

  onSensationToggle(sensation: string) {
    const index = this.selectedSensations.indexOf(sensation);
    if (index > -1) {
      this.selectedSensations.splice(index, 1);
    } else {
      this.selectedSensations.push(sensation);
    }
    this.filterLocations();
  }

  onSmellToggle(smell: string) {
    const index = this.selectedSmells.indexOf(smell);
    if (index > -1) {
      this.selectedSmells.splice(index, 1);
    } else {
      this.selectedSmells.push(smell);
    }
    this.filterLocations();
  }

  private filterLocations() {
    this.filteredLocations = this.locations.filter(location => {
      const matchesSearch = !this.searchTerm || 
        location.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesSensations = this.selectedSensations.length === 0 ||
        this.selectedSensations.some(sensation => 
          location.sensations?.includes(sensation)
        );

      const matchesSmells = this.selectedSmells.length === 0 ||
        this.selectedSmells.some(smell => 
          location.smells?.includes(smell)
        );

      console.log('Location:', location);
      console.log('Images:', location.images);

      return matchesSearch && matchesSensations && matchesSmells;
    });
    console.log('Filtered Locations after filter:', this.filteredLocations);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedSensations = [];
    this.selectedSmells = [];
    this.filterLocations();
  }

  viewLocationDetails(locationId: string) {
    this.router.navigate(['/locations', locationId]);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCreatorName(createdBy: any): string {
    return getCreatorName(createdBy);
  }

  hasActiveFilters(): boolean {
    return this.selectedSensations.length > 0 || this.selectedSmells.length > 0;
  }

  onImageError(location: LocationType) {
    console.error(`Error loading image for location ${location.name}: ${location.images?.[0]?.src || 'No image'}`);
    this.notificationService.error(`No se pudo cargar la imagen para ${location.name}`);
  }
}