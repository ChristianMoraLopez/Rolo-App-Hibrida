import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocationService, CreateLocationData } from '../../../core/services/location.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.page.html',
  styleUrls: ['./add-location.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddLocationPage implements OnInit, OnDestroy {
  locationData: CreateLocationData = {
    name: '',
    description: '',
    address: '',
    sensations: [],
    smells: [],
    images: [],
    coordinates: undefined
  };

  availableSensations = [
    'Tranquilo', 'Energético', 'Nostálgico', 'Inspirador', 'Relajante', 
    'Vibrante', 'Misterioso', 'Acogedor', 'Dinámico', 'Sereno'
  ];
  
  availableSmells = [
    'Café', 'Flores', 'Comida', 'Naturaleza', 'Urbano', 
    'Dulce', 'Especias', 'Mar', 'Tierra', 'Fresco'
  ];

  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  loading = false;
  gettingLocation = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private locationService: LocationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Auto-get current location
    this.getCurrentLocation();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Clean up preview URLs
    this.imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
  }

  async getCurrentLocation() {
    this.gettingLocation = true;
    try {
      const position = await Geolocation.getCurrentPosition();
      this.locationData.coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      // Try to get address from coordinates (reverse geocoding)
      await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
      
      this.notificationService.success('Ubicación obtenida exitosamente');
    } catch (error) {
      console.error('Error getting location:', error);
      this.notificationService.warning('No se pudo obtener la ubicación automáticamente');
    } finally {
      this.gettingLocation = false;
    }
  }

  private async reverseGeocode(lat: number, lng: number) {
    try {
      // You can use a geocoding service here
  // For now, we'll use a simple placeholder showing coordinates
  this.locationData.address = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  }

  async selectFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        const file = this.dataURLtoFile(image.dataUrl, `image_${Date.now()}.jpg`);
        this.selectedImages.push(file);
        this.imagePreviewUrls.push(image.dataUrl);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      this.notificationService.error('Error al seleccionar imagen');
    }
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        const file = this.dataURLtoFile(image.dataUrl, `photo_${Date.now()}.jpg`);
        this.selectedImages.push(file);
        this.imagePreviewUrls.push(image.dataUrl);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      this.notificationService.error('Error al tomar foto');
    }
  }

  removeImage(index: number) {
    if (this.imagePreviewUrls[index]) {
      URL.revokeObjectURL(this.imagePreviewUrls[index]);
    }
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  onSensationToggle(sensation: string) {
    const index = this.locationData.sensations!.indexOf(sensation);
    if (index > -1) {
      this.locationData.sensations!.splice(index, 1);
    } else {
      this.locationData.sensations!.push(sensation);
    }
  }

  onSmellToggle(smell: string) {
    const index = this.locationData.smells!.indexOf(smell);
    if (index > -1) {
      this.locationData.smells!.splice(index, 1);
    } else {
      this.locationData.smells!.push(smell);
    }
  }

  async createLocation() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    try {
      // Add selected images to location data
      this.locationData.images = this.selectedImages;

      const newLocation = await this.locationService.createLocation(this.locationData);
      
      this.notificationService.success('Ubicación creada exitosamente');
      this.router.navigate(['/locations', newLocation._id]);
    } catch (error) {
      console.error('Error creating location:', error);
      this.notificationService.error('Error al crear la ubicación');
    } finally {
      this.loading = false;
    }
  }

  private validateForm(): boolean {
    if (!this.locationData.name?.trim()) {
      this.notificationService.error('El nombre es obligatorio');
      return false;
    }

    if (!this.locationData.description?.trim()) {
      this.notificationService.error('La descripción es obligatoria');
      return false;
    }

    if (!this.locationData.coordinates) {
      this.notificationService.error('La ubicación es obligatoria');
      return false;
    }

    return true;
  }

  private dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  // Utility methods
  isSensationSelected(sensation: string): boolean {
    return this.locationData.sensations!.includes(sensation);
  }

  isSmellSelected(smell: string): boolean {
    return this.locationData.smells!.includes(smell);
  }

  hasSelectedSensations(): boolean {
    return this.locationData.sensations!.length > 0;
  }

  hasSelectedSmells(): boolean {
    return this.locationData.smells!.length > 0;
  }
}
