import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private apiUrl = 'http://localhost:3000/flatrate'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  getFlatRate(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getKey`);
  }

  updateFlatRate(flatRateId: string, key: string, value: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateKey/${flatRateId}`, { key, value });
  }
}
