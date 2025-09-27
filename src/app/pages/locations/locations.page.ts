import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientModule } from '@angular/common/http'; 
import { LocationService } from '../../core/services/location.service';
import { LocationType } from '@entities/location-types';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.page.html',
  styleUrls: ['./locations.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, GoogleMapsModule, HttpClientModule]
})
export class LocationsPage implements OnInit {
  locations: LocationType[] = [];
  filteredLocations: LocationType[] = [];
  isLoading: boolean = false;
  mapOptions: google.maps.MapOptions = {
    center: { lat: 4.6097, lng: -74.0817 },
    zoom: 12
  };
  selectedLocation: LocationType | null = null;
  apiLoaded: boolean = false;
  apiLoadError: string | null = null;

  constructor(private locationService: LocationService) {}

  async ngOnInit() {
    // Cargar Google Maps API
    try {
      await this.loadGoogleMaps();
      this.apiLoaded = true;
    } catch (error) {
      this.apiLoadError = 'Error cargando Google Maps. Verifica tu configuración.';
      console.error('Google Maps load error:', error);
    }

    // Suscribirse a las ubicaciones
    this.locationService.locations$.subscribe(locations => {
      console.log('Locations:', locations);
      this.locations = locations;
      this.filteredLocations = locations;
    });
    
    this.locationService.loading$.subscribe(loading => {
      console.log('Loading:', loading);
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
    
    this.filteredLocations = this.locations.filter(location => {
      return (
        location.name.toLowerCase().includes(query) ||
        location.description.toLowerCase().includes(query)
      );
    });
  }

  truncateDescription(description: string, maxLength: number = 120): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  processArrayString(input: string[]): string {
    try {
      const jsonString = input.join("");
      const parsedArray = JSON.parse(jsonString);
      return Array.isArray(parsedArray) ? parsedArray[0] : input[0];
    } catch (error) {
      console.error("Error parsing JSON string:", error);
      return input[0] || '';
    }
  }

  selectLocation(location: LocationType) {
    this.selectedLocation = location;
    // Aquí puedes navegar a la página de detalles
    // this.router.navigate(['/locations', location._id]);
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
}