import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationService } from '../../../core/services/location.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LocationType, getCreatorName } from '../../../core/entities/location-types';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ExplorePage implements OnInit, OnDestroy {
  locations: LocationType[] = [];
  filteredLocations: LocationType[] = [];
  loading = false;
  searchTerm = '';
  
  // Filter options
  selectedSensations: string[] = [];
  selectedSmells: string[] = [];
  
  // Available filters (you can expand these)
  availableSensations = ['Tranquilo', 'Energético', 'Nostálgico', 'Inspirador', 'Relajante'];
  availableSmells = ['Café', 'Flores', 'Comida', 'Naturaleza', 'Urbano'];

  private subscriptions: Subscription[] = [];

  constructor(
    private locationService: LocationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupSubscriptions();
    this.loadLocations();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    this.subscriptions.push(
      this.locationService.locations$.subscribe(locations => {
        this.locations = locations;
        this.filterLocations();
      })
    );

    this.subscriptions.push(
      this.locationService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );
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
      // Search term filter
      const matchesSearch = !this.searchTerm || 
        location.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Sensations filter
      const matchesSensations = this.selectedSensations.length === 0 ||
        this.selectedSensations.some(sensation => 
          location.sensations?.includes(sensation)
        );

      // Smells filter
      const matchesSmells = this.selectedSmells.length === 0 ||
        this.selectedSmells.some(smell => 
          location.smells?.includes(smell)
        );

      return matchesSearch && matchesSensations && matchesSmells;
    });
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

  // Utility methods
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
}