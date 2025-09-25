import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class GoogleMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() locations: any[] = [];
  @Input() center = { lat: 4.6097, lng: -74.0817 }; // Bogotá
  @Input() zoom = 12;
  @Output() locationSelected = new EventEmitter<any>();

  map: any;
  markers: any[] = [];
  isMapLoaded = false;
  mapError: string | null = null;

  ngOnInit() {
    this.loadGoogleMaps();
  }

  ngAfterViewInit() {
    if (this.isMapLoaded) {
      this.initializeMap();
    }
  }

  private loadGoogleMaps() {
    if (window.google && window.google.maps) {
      this.isMapLoaded = true;
      return;
    }

    // avoid adding the script multiple times
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      // script already present; wait for initMap callback if possible
      return;
    }

    const apiKey = (environment && (environment as any).googleMapsApiKey) ? (environment as any).googleMapsApiKey : '';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    // expose initMap for the callback
    (window as any).initMap = () => {
      this.isMapLoaded = true;
      if (this.mapContainer) {
        this.initializeMap();
      }
    };

    script.onerror = () => {
      this.mapError = 'Error cargando Google Maps. Verifica tu configuración.';
    };

    document.head.appendChild(script);
  }

  private initializeMap() {
    if (!this.mapContainer || !window.google) return;

    try {
      const mapOptions = {
        center: this.center,
        zoom: this.zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      this.map = new window.google.maps.Map(
        this.mapContainer.nativeElement,
        mapOptions
      );

      this.addMarkers();
    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapError = 'Error inicializando el mapa';
    }
  }

  private addMarkers() {
    if (!this.map || !window.google) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    this.locations.forEach(location => {
      if (location && location.latitude && location.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: this.map,
          title: location.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#0D3ADB',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        });

        const locId = location._id ? String(location._id) : `no-id-${Math.random().toString(36).slice(2,8)}`;

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="map-info-window">
              <h3>${location.name || 'Sin nombre'}</h3>
              <p>${location.description || ''}</p>
              <button id="info-btn-${locId}">Ver detalles</button>
            </div>
          `
        });

        // when the info window DOM is ready, attach the click handler to the button
        window.google.maps.event.addListener(infoWindow, 'domready', () => {
          const btn = document.getElementById(`info-btn-${locId}`);
          if (btn) {
            // safeguard: remove prior listener by cloning
            const newBtn = btn.cloneNode(true) as HTMLElement;
            btn.parentNode?.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
              this.locationSelected.emit(location);
            });
          }
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });

        this.markers.push(marker);
      }
    });
  }

  updateLocations(locations: any[]) {
    this.locations = locations;
    if (this.isMapLoaded) {
      this.addMarkers();
    }
  }
}
