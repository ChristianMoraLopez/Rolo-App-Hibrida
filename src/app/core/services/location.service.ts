import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { LocationType, NewLocation, UpdateLocation } from '@entities/location-types';

export interface CreateLocationData {
  name: string;
  description: string;
  images?: File[];
  address: string;
  sensations?: string[];
  smells?: string[];
  coordinates?: { lat: number; lng: number };
  latitude?: number;
  longitude?: number;
}

// Interface para locaciones premium
export interface PremiumLocation {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  capacity: number;
  amenities: string[];
  location: string;
  category: 'wedding' | 'corporate' | 'birthday' | 'quinceañera' | 'graduation' | 'other';
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationsSubject = new BehaviorSubject<LocationType[]>([]);
  private currentLocationSubject = new BehaviorSubject<LocationType | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private premiumLocationsSubject = new BehaviorSubject<PremiumLocation[]>([]);

  public locations$ = this.locationsSubject.asObservable();
  public currentLocation$ = this.currentLocationSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public premiumLocations$ = this.premiumLocationsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialLocations();
    this.loadPremiumLocations();
  }

  private async loadInitialLocations(): Promise<void> {
    await this.fetchLocations();
  }

  private loadPremiumLocations(): void {
    // Mock de locaciones premium
    const mockPremiumLocations: PremiumLocation[] = [
      {
        _id: 'premium-1',
        name: 'Hacienda Villa Esperanza',
        description: 'Elegante hacienda colonial con jardines exuberantes y arquitectura tradicional. Perfecta para bodas y eventos corporativos de lujo.',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop',
        price: 8500000,
        rating: 4.9,
        capacity: 300,
        amenities: ['Jardín amplio', 'Salón climatizado', 'Cocina industrial', 'Parqueadero', 'Decoración incluida'],
        location: 'La Calera, Cundinamarca',
        category: 'wedding'
      },
      {
        _id: 'premium-2',
        name: 'Centro de Convenciones Metropolitan',
        description: 'Moderno centro de convenciones en el corazón de Bogotá. Equipado con tecnología de punta para eventos corporativos.',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
        price: 12000000,
        rating: 4.8,
        capacity: 500,
        amenities: ['Tecnología audiovisual', 'Internet de alta velocidad', 'Catering incluido', 'Servicio de traducción'],
        location: 'Zona Rosa, Bogotá',
        category: 'corporate'
      },
      {
        _id: 'premium-3',
        name: 'Quinta Los Arrayanes',
        description: 'Encantadora quinta campestre rodeada de naturaleza. Ideal para celebraciones familiares y quinceañeras.',
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop',
        price: 6500000,
        rating: 4.7,
        capacity: 150,
        amenities: ['Piscina', 'Kiosco BBQ', 'Juegos infantiles', 'Zona verde amplia'],
        location: 'Cajicá, Cundinamarca',
        category: 'birthday'
      },
      {
        _id: 'premium-4',
        name: 'Salón Crystal Palace',
        description: 'Elegante salón de eventos con decoración de cristal y luces LED. Perfecto para quinceañeras y graduaciones.',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
        price: 4800000,
        rating: 4.6,
        capacity: 200,
        amenities: ['Pista de baile', 'Sistema de sonido profesional', 'Iluminación LED', 'Área VIP'],
        location: 'Chapinero, Bogotá',
        category: 'quinceañera'
      },
      {
        _id: 'premium-5',
        name: 'Club Campestre El Refugio',
        description: 'Exclusivo club campestre con vistas panorámicas y servicios de lujo. Para eventos sofisticados y memorables.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
        price: 15000000,
        rating: 5.0,
        capacity: 400,
        amenities: ['Campo de golf', 'Spa', 'Restaurant gourmet', 'Helipuerto', 'Suite nupcial'],
        location: 'Chía, Cundinamarca',
        category: 'wedding'
      },
      {
        _id: 'premium-6',
        name: 'Auditorio Universidad Elite',
        description: 'Moderno auditorio universitario con capacidad para grandes eventos académicos y graduaciones.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        price: 3500000,
        rating: 4.5,
        capacity: 800,
        amenities: ['Proyección 4K', 'Sistema de sonido surround', 'Aire acondicionado', 'Accesibilidad completa'],
        location: 'Universidad Nacional, Bogotá',
        category: 'graduation'
      }
    ];

    this.premiumLocationsSubject.next(mockPremiumLocations);
  }

  async fetchLocations(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const locations = await firstValueFrom(this.apiService.get<LocationType[]>('locations'));
      this.locationsSubject.next(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async fetchLocationById(id: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const location = await firstValueFrom(this.apiService.get<LocationType>(`locations/${id}`));
      this.currentLocationSubject.next(location);
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createLocation(locationData: CreateLocationData): Promise<LocationType> {
    this.loadingSubject.next(true);
    try {
      const latitude = locationData.coordinates?.lat || locationData.latitude;
      const longitude = locationData.coordinates?.lng || locationData.longitude;

      if (latitude === undefined || longitude === undefined) {
        throw new Error('Location coordinates are required');
      }

      const formData = new FormData();
      formData.append('name', locationData.name);
      formData.append('description', locationData.description);
      formData.append('address', locationData.address);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());

      if (locationData.images && locationData.images.length > 0) {
        locationData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      if (locationData.sensations && locationData.sensations.length > 0) {
        formData.append('sensations', JSON.stringify(locationData.sensations));
      }

      if (locationData.smells && locationData.smells.length > 0) {
        formData.append('smells', JSON.stringify(locationData.smells));
      }

      const newLocation = await firstValueFrom(this.apiService.postFormData<LocationType>('locations', formData));

      const currentLocations = this.locationsSubject.value;
      this.locationsSubject.next([...currentLocations, newLocation]);

      return newLocation;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateLocation(id: string, locationData: Partial<CreateLocationData>): Promise<LocationType> {
    this.loadingSubject.next(true);
    try {
      const formData = new FormData();

      if (locationData.name) formData.append('name', locationData.name);
      if (locationData.description) formData.append('description', locationData.description);
      if (locationData.address) formData.append('address', locationData.address);

      if (locationData.coordinates) {
        formData.append('latitude', locationData.coordinates.lat.toString());
        formData.append('longitude', locationData.coordinates.lng.toString());
      } else if (locationData.latitude !== undefined && locationData.longitude !== undefined) {
        formData.append('latitude', locationData.latitude.toString());
        formData.append('longitude', locationData.longitude.toString());
      }

      if (locationData.images && locationData.images.length > 0) {
        locationData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      if (locationData.sensations) {
        formData.append('sensations', JSON.stringify(locationData.sensations));
      }

      if (locationData.smells) {
        formData.append('smells', JSON.stringify(locationData.smells));
      }

      const updatedLocation = await firstValueFrom(this.apiService.putFormData<LocationType>(`locations/${id}`, formData));

      const currentLocations = this.locationsSubject.value;
      const updatedLocations = currentLocations.map(location =>
        location._id === id ? updatedLocation : location
      );
      this.locationsSubject.next(updatedLocations);

      if (this.currentLocationSubject.value?._id === id) {
        this.currentLocationSubject.next(updatedLocation);
      }

      return updatedLocation;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteLocation(id: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
      await firstValueFrom(this.apiService.delete(`locations/${id}`));

      const currentLocations = this.locationsSubject.value;
      const filteredLocations = currentLocations.filter(location => location._id !== id);
      this.locationsSubject.next(filteredLocations);

      if (this.currentLocationSubject.value?._id === id) {
        this.currentLocationSubject.next(null);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async commentLocation(locationId: string, content: string): Promise<void> {
    this.loadingSubject.next(true);
    try {
      await firstValueFrom(this.apiService.post(`locations/${locationId}/comments`, { content }));

      if (this.currentLocationSubject.value?._id === locationId) {
        await this.fetchLocationById(locationId);
      }
    } catch (error) {
      console.error('Error commenting location:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // Método para obtener locaciones premium
  getPremiumLocations(): Observable<PremiumLocation[]> {
    return this.premiumLocations$;
  }

  // Método para obtener locaciones premium por categoría
  getPremiumLocationsByCategory(category: PremiumLocation['category']): Observable<PremiumLocation[]> {
    return this.premiumLocations$.pipe(
      map(locations => locations.filter(location => location.category === category))
    );
  }

  // Método para filtrar locaciones premium por precio
  getPremiumLocationsByPriceRange(minPrice: number, maxPrice: number): Observable<PremiumLocation[]> {
    return this.premiumLocations$.pipe(
      map(locations => locations.filter(location => 
        location.price >= minPrice && location.price <= maxPrice
      ))
    );
  }

  getLocations(): LocationType[] {
    return this.locationsSubject.value;
  }

  getCurrentLocation(): LocationType | null {
    return this.currentLocationSubject.value;
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}