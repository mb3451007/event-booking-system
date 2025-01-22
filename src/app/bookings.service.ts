import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
private apiUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }


    // Add Item
    addItem(item:any): Observable<any> {
      console.log(item,'this is the data to add item')
      return this.http.post(`${this.apiUrl}/booking/add-booking`, item);
    }
  
    // Get Paginated Items
    getPaginatedItems(pageNumber: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/booking/get-bookings/${pageNumber}`);
    }
  
    // Get All Items
    getAllItems(): Observable<any> {
      return this.http.get(`${this.apiUrl}/booking/get-bookings`);
    }
  
    // Delete Item
    deleteItem(itemId: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/booking/delete-booking/${itemId}`);
    }
  
    // Update Item
    updateItem(itemId: number, item:any): Observable<any> {
      console.log(item,'this is the data to update item also peckages')
      return this.http.patch(`${this.apiUrl}/booking/update-booking/${itemId}`, item);
    }
    
}
 
