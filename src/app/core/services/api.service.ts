// C:\ChristianMoraProjects\RoloApp\Híbrida\rolo-app\src\app\services\api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  private getHeaders(isFormData: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.API_BASE_URL}/${endpoint}`, {
      headers: this.getHeaders(),
      params,
      responseType: 'json'
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.API_BASE_URL}/${endpoint}`, data, {
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.API_BASE_URL}/${endpoint}`, data, {
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.API_BASE_URL}/${endpoint}`, {
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.API_BASE_URL}/${endpoint}`, formData, {
      headers: this.getHeaders(true), // No Content-Type for FormData
      responseType: 'json'
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  putFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.put<T>(`${this.API_BASE_URL}/${endpoint}`, formData, {
      headers: this.getHeaders(true), // No Content-Type for FormData
      responseType: 'json'
    }).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

 
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'Ocurrió un error inesperado';

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // Server-side error
    errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
    if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado.';
    }
  }

  this.showErrorToast(errorMessage);
  return throwError(() => new Error(errorMessage));
}

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  getApiUrl(): string {
    return this.API_BASE_URL;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}