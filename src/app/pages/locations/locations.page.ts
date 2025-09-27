import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientModule } from '@angular/common/http';
import { LocationService } from '../../core/services/location.service';
import { LocationType } from '@entities/location-types';
import { GoogleMapComponent } from '../../shared/components/google-map/google-map.component';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.page.html',
  styleUrls: ['./locations.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, GoogleMapsModule, HttpClientModule, GoogleMapComponent]
})
export class LocationsPage implements OnInit {
  locations: LocationType[] = [];
  filteredLocations: LocationType[] = [];
  isLoading: boolean = false;
  mapOptions: google.maps.MapOptions = {
    center: { lat: 4.6097, lng: -74.0817 },
    zoom: 12,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  };
  selectedLocation: LocationType | null = null;
  apiLoaded: boolean = false;
  apiLoadError: string | null = null;

  constructor(private locationService: LocationService) {}

  async ngOnInit() {
    try {
      await this.loadGoogleMaps();
      this.apiLoaded = true;
      console.log('Google Maps API loaded successfully');
    } catch (error) {
      this.apiLoadError = 'Error cargando Google Maps. Verifica tu configuración.';
      console.error('Google Maps load error:', error);
      this.apiLoaded = false;
    }

    this.locationService.locations$.subscribe(locations => {
      this.locations = locations;
      this.filteredLocations = locations;
    });

    this.locationService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    await this.locationService.fetchLocations();
  }

  async loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return new Promise((resolve, reject) => {
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Error cargando Google Maps'));
    });
  }

  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (!query) {
      this.filteredLocations = this.locations;
      return;
    }
    this.filteredLocations = this.locations.filter(location =>
      location.name.toLowerCase().includes(query) ||
      location.description.toLowerCase().includes(query)
    );
  }

  truncateDescription(description: string, maxLength: number = 120): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  processArrayString(input: string[]): string[] {
    try {
      if (input.length === 1 && typeof input[0] === 'string') {
        const parsedArray = JSON.parse(input[0]);
        return Array.isArray(parsedArray) ? parsedArray : input;
      }
      const jsonString = input.join('');
      const parsedArray = JSON.parse(jsonString);
      return Array.isArray(parsedArray) ? parsedArray : input;
    } catch (error) {
      console.error('Error processing array string:', error);
      return input;
    }
  }

  selectLocation(location: LocationType) {
    this.selectedLocation = location;
    // Optionally navigate to a detail page
    // this.router.navigate(['/locations', location._id]);
  }

  onLocationSelected(location: LocationType) {
    this.selectLocation(location);
  }

  closeInfoWindow() {
    this.selectedLocation = null;
  }

  async createTestLocation() {
    try {
      const newLocation = await this.locationService.createLocation({
        name: 'Test Location',
        description: 'A sample location for testing',
        address: '123 Test St, City',
        latitude: 4.6097,
        longitude: -74.0817,
        sensations: ['calm', 'peaceful'],
        smells: ['fresh', 'floral']
      });
      console.log('Created location:', newLocation);
    } catch (error) {
      console.error('Error creating test location:', error);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}