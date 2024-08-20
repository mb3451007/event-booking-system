import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private apiUrl = 'http://localhost:3000';
  constructor(private http:HttpClient) { }


    // Add Item
    addItem(item:any): Observable<any> {
      return this.http.post(`${this.apiUrl}/item/add-item`, item);
    }
  
    // Get Paginated Items
    getPaginatedItems(pageNumber: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/item/get-items/${pageNumber}`);
    }
  
    // Get All Items
    getAllItems(): Observable<any> {
      console.log('here at all items');
      return this.http.get(`${this.apiUrl}/item/get-items`);
    }
  
    // Delete Item
    deleteItem(itemId: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/item/delete-item/${itemId}`);
    }
  
    // Update Item
    updateItem(itemId: number, item:any): Observable<any> {
      return this.http.patch(`${this.apiUrl}/item/update-item/${itemId}`, item);
    }
    
}