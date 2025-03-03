import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailServiceService {
private apiUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }


    sendEmail(email:any): Observable<any> {
      return this.http.post(`${this.apiUrl}/email/send`, email);
    }

}
