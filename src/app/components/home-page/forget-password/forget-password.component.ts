import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit{
  passwordForm: FormGroup;
  passwordMismatch: boolean = false;
  userId: string | null = null;
  isLoading:boolean=false
  constructor(private fb: FormBuilder, private toastr: ToastrService, private loginService:LoginService) {
    this.passwordForm = this.fb.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }
  ngOnInit(): void {
   
    this.userId = localStorage.getItem('userId');

    if (!this.userId) {
      console.error("User ID not found in localStorage.");
      
    }
  }

  resetPassword() {
    this.isLoading = true;
    const newPassword = this.passwordForm.value.newPassword;
    const confirmPassword = this.passwordForm.value.confirmPassword;
    if (newPassword !== confirmPassword) {
      this.passwordMismatch = true;
      console.log(this.passwordMismatch,'password mismatch')
      return;
    }
     else {
      this.passwordMismatch = false;
      if(this.userId){
      this.loginService.resetPassword(this.userId, newPassword, confirmPassword)
        .subscribe({
          next: (res) => {
            this.toastr.success('Password updated successfully!');
            this.isLoading = false;
            this.passwordForm.reset();
          },
          error: (err) => {
            this.toastr.error('Failed to update password.');
            this.isLoading = false;
          }
        });
    }
  }
  }
}
