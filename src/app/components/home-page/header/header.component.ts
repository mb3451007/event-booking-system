import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService } from 'src/app/setting.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  // options: string[] = ['My Profile', 'My Balance', 'Inbox','Account Settings','Logout'];
  options: string[] = ['Logout'];
  creats: string[] = ['Action', 'Another action ', 'Something else here'];

  selectedOption: string | null = null;
  isDropdownOpen: boolean = false;
  selectedCreate: string | null = null;
  isDropdownCreateOpen: boolean = false;

  constructor(private router: Router, private service:SettingService) {}
  toggleDropdown(event: MouseEvent) {
    this.isDropdownOpen = !this.isDropdownOpen;
    event.stopPropagation();
  }
  
  toggleCreateDropdown(event: MouseEvent) {
    this.isDropdownCreateOpen = !this.isDropdownCreateOpen;
    event.stopPropagation();
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    // Check if the click target is outside the dropdown container
    const target = event.target as HTMLElement;
    const isInside = target.closest('.dropdown-container');
    if (!isInside) {
      this.isDropdownOpen = false;
      this.isDropdownCreateOpen=false;
    }
  }
  selectOption(option: string) {
    this.selectedOption = option;
    this.isDropdownOpen = false;
    if(option==='Logout'){
      localStorage.removeItem('token')
      this.router.navigate(['/login']);
      // this.getRouterLink('Logout')
    }
  }
  selectcreate(create: string) {
    this.selectedCreate = create;
    this.isDropdownCreateOpen = false;
  }

  getRouterLink(option: string): string | null {
    if (option === 'Logout') {
      return '/login';
    }
    return null; // No link for other options
  } 


toggleSideBar(){
this.service.toggleSideBar()
}
}
