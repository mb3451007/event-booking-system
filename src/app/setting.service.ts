import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
 
  private apiUrl = environment.apiUrl; 


  constructor(private http: HttpClient) {}

  getFlatRate(): Observable<any> {
    return this.http.get(`${this.apiUrl}/flatrate/getKey`);
  }

  updateFlatRate(flatRateId: string, key: string, value: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/flatrate/updateKey/${flatRateId}`, { key, value });
  }
}
