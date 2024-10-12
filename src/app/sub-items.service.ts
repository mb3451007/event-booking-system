import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SubItemsService {
  private apiUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }


    // Add SubItem
    addSubItem(item:any): Observable<any> {
      return this.http.post(`${this.apiUrl}/subItem/add-Subitem`, item);
    }
  
    // Get SubPaginated Items
    getPaginatedSubItems(pageNumber: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/subItem/get-Subitems/${pageNumber}`);
    }
  
    // Get All SubItems
    getAllSubItems(): Observable<any> {
      console.log('here at all items');
      return this.http.get(`${this.apiUrl}/subItem/get-Subitems`);
    }
  
    // Delete Item
    deleteSubItem(SubitemId: number): Observable<any> {
      console.log('this is id fot delete in ser',SubitemId)
      return this.http.delete(`${this.apiUrl}/subItem/delete-Subitem/${SubitemId}`);
    }
  
    // Update Item
    updateSubItem(SubitemId: number, item:any): Observable<any> {
      return this.http.patch(`${this.apiUrl}/subItem/update-Subitem/${SubitemId}`, item);
    }
}
