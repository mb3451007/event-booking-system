import { Component } from '@angular/core';
import { SettingComponent } from '../components/home-page/setting/setting.component';
import { SettingService } from '../setting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar-mobile',
  templateUrl: './side-bar-mobile.component.html',
  styleUrls: ['./side-bar-mobile.component.scss']
})
export class SideBarMobileComponent {
 constructor(private service:SettingService,private router:Router){}
 toggleSideBar(){
  this.service.toggleSideBar()
 }
logout() {
  localStorage.clear();
  this.router.navigate(['/login']);
  this.toggleSideBar()
}
}
