// C:\ChristianMoraProjects\RoloApp\Híbrida\src\app\core\services\location.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '@services/api.service';
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

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationsSubject = new BehaviorSubject<LocationType[]>([]);
  private currentLocationSubject = new BehaviorSubject<LocationType | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public locations$ = this.locationsSubject.asObservable();
  public currentLocation$ = this.currentLocationSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadInitialLocations();
  }

  private async loadInitialLocations(): Promise<void> {
    await this.fetchLocations();
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
      const updatedLocations = currentLocations.map(loc =>
        loc._id === id ? updatedLocation : loc
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
      const filteredLocations = currentLocations.filter(loc => loc._id !== id);
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