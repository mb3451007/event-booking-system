import { Component, OnInit } from '@angular/core';
import { SettingService } from 'src/app/setting.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
    animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0%)', opacity: 1 })),
      state('out', style({ transform: 'translateX(-100%)', opacity: 0 })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class HomePageComponent implements OnInit {
sidebarVisible: boolean = true;
constructor(private service:SettingService,private router:Router){}
ngOnInit(): void {
   this.service.sideBarDisplay$.subscribe(value =>{
    this.sidebarVisible=value;
   })
}
isMobileScreen(): boolean {
  return window.innerWidth <= 768;
}
logout() {
  localStorage.clear();
  this.router.navigate(['/login']);
}
isMobileSidebarVisible = false;

toggleSideBar() {
  this.isMobileSidebarVisible = !this.isMobileSidebarVisible;
}
}
