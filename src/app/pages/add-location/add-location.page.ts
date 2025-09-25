import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GoogleMapComponent } from '../../shared/components/google-map/google-map.component';

@Component({
  selector: 'app-add-location',
  template: `
    <ion-content>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Agregar Ubicación</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <form (ngSubmit)="onSubmit()" #locationForm="ngForm">
          <ion-list>
            <ion-item>
              <ion-input 
                label="Nombre del lugar" 
                [(ngModel)]="location.name" 
                name="name" 
                required>
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-textarea 
                label="Descripción" 
                [(ngModel)]="location.description" 
                name="description" 
                rows="3">
              </ion-textarea>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">RoloApp</ion-label>
              <ion-select [(ngModel)]="location.sensations" name="sensations" multiple="true">
                <ion-select-option value="tranquilo">Tranquilo</ion-select-option>
                <ion-select-option value="seguro">Seguro</ion-select-option>
                <ion-select-option value="amigable">Amigable</ion-select-option>
                <ion-select-option value="ruidoso">Ruidoso</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <div class="map-container">
            <app-google-map
              [locations]="[]"
              (locationSelected)="onLocationSelect($event)">
            </app-google-map>
          </div>

          <ion-button expand="block" type="submit" [disabled]="!locationForm.form.valid">
            Guardar Ubicación
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .map-container {
      height: 300px;
      margin: 1rem 0;
      border-radius: 8px;
      overflow: hidden;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, GoogleMapComponent]
})
export class AddLocationPage {
  location = {
    name: '',
    description: '',
    sensations: [],
    latitude: null,
    longitude: null
  };

  onLocationSelect(event: any) {
    this.location.latitude = event.lat;
    this.location.longitude = event.lng;
  }

  onSubmit() {
    if (!this.location.latitude || !this.location.longitude) {
      // Show error message
      return;
    }
    console.log('Location to save:', this.location);
    // Implement save logic
  }
}
