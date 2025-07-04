import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private apiUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }


    // Add Item
    addItem(item:any): Observable<any> {
      console.log(item,'this is the data to add item')
      return this.http.post(`${this.apiUrl}/item/add-item`, item);
    }
  
    // Get Paginated Items
    getPaginatedItems(pageNumber: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/item/get-items/${pageNumber}`);
    }
  
    // Get All Items
    getAllItems(): Observable<any> {
      return this.http.get(`${this.apiUrl}/item/get-items`);
    }
  
    // Delete Item
    deleteItem(itemId: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/item/delete-item/${itemId}`);
    }
  
    // Update Item
    updateItem(itemId: number, item:any): Observable<any> {
      console.log(item,'this is the data to update item also peckages')
      return this.http.patch(`${this.apiUrl}/item/update-item/${itemId}`, item);
    }
    
}