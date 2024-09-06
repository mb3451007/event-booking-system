import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PackagesService {
  private apiUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  // Add Item
  addPeckage(item: any): Observable<any> {
    console.log(item, 'this is the data to add item');
    return this.http.post(`${this.apiUrl}/package/add-package`, item);
  }

  // Get Paginated Items
  getPaginatedPeckage(pageNumber: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/package/get-package/${pageNumber}`);
  }

  // Get All Items
  getAllPeckage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/package/get-package`);
  }

  // Delete Item
  deletePeckage(packageId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/package/delete-package/${packageId}`
    );
  }

  // Update Item
  updatePeckage(packageId: number, item: any): Observable<any> {
    console.log(item, 'this is the data to update item');
    return this.http.patch(
      `${this.apiUrl}/package/update-package/${packageId}`,
      item
    );
  }
  getPackageById(packageId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/package/get-packageById/${packageId}`
    );
  }
}
