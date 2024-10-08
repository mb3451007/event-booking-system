import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  resetPassword(userId: string, newPassword: string, confirmPassword: string): Observable<any> {
   const data ={
    newPassword: newPassword,
    confirmPassword: confirmPassword
   }
   return this.http.post(`${this.apiUrl}/resetPassword/${userId}`,data)
  }
}
