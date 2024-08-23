import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:3000';
  constructor(private http:HttpClient) { }

  onLogin(data:any){
    console.log(data,'its data coming in login')
   return this.http.post(`${this.apiUrl}/login`,data)
  }
}
