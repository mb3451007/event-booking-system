import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {
  loginForm:FormGroup
  constructor(private router: Router, private fb:FormBuilder, private LoginService:LoginService){
    this.loginForm=this.fb.group({
      username:['',Validators.required],
      password:['',Validators.required]
    })
  }

   // Simulate a login function
   onLogin() {
const loginData={
  username:this.loginForm.value.username,
  password:this.loginForm.value.password
}
    console.log(loginData)
    this.LoginService.onLogin(loginData).subscribe({
      next:(response:any)=>{
        localStorage.setItem('token',response.token)
        console.log(response, 'this is login response')
        this.router.navigate(['/dashboard']);
      },
      error: (error)=>{
        console.log(error,'Error Loging in')
      }
    })
  }
}
