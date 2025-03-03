import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from '../home-page/home-page.component';
import { SideBarComponent } from '../home-page/side-bar/side-bar.component';
import { HeaderComponent } from '../home-page/header/header.component';
import { FooterComponent } from '../home-page/footer/footer.component';
import { DashBoardComponent } from '../home-page/dash-board/dash-board.component';
import { ButtonPageComponent } from '../home-page/button-page/button-page.component';
import { AlertPageComponent } from '../home-page/alert-page/alert-page.component';
import { BookingPageComponent } from '../home-page/booking-page/booking-page.component';
import { CustomerPageComponent } from '../home-page/customer-page/customer-page.component';
import { TransactionPageComponent } from '../home-page/transaction-page/transaction-page.component';
import { ItemsPageComponent } from '../home-page/items-page/items-page.component';
import { SubItemsPageComponent } from '../home-page/sub-items-page/sub-items-page.component';
import { authGuard } from 'src/app/auth.guard';
import { SettingComponent } from '../home-page/setting/setting.component';
import { PeckagesComponent } from '../home-page/peckages/peckages.component';
import { PackageDetailsComponent } from '../home-page/package-details/package-details.component';
import { ForgetPasswordComponent } from '../home-page/forget-password/forget-password.component';
import { UpdateBookingComponent } from '../update-booking/update-booking.component';
import { AddBookingComponent } from '../add-booking/add-booking.component';
import { ViewBookingComponent } from '../view-booking/view-booking.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'bookings',
        pathMatch: 'full',
      },
      { path: 'dashboard', component: DashBoardComponent },

      { path: 'sidebar', component: SideBarComponent },
      { path: 'header', component: HeaderComponent },
      { path: 'footer', component: FooterComponent },
      { path: 'button', component: ButtonPageComponent },
      { path: 'alert', component: AlertPageComponent },
      { path: 'bookings', component: BookingPageComponent },
      { path: 'customers', component: CustomerPageComponent },
      { path: 'Transactions', component: TransactionPageComponent },
      { path: 'items', component: ItemsPageComponent },
      { path: 'subitems', component: SubItemsPageComponent },
      { path: 'settings', component: SettingComponent },
      { path: 'packages', component: PeckagesComponent },
      { path: 'resetPassword', component: ForgetPasswordComponent },
      { path: 'update-booking', component: UpdateBookingComponent },
      { path: 'add-booking', component: AddBookingComponent },
      { path: 'view-booking', component: ViewBookingComponent },
      { path: 'package-detail/:itemId', component: PackageDetailsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
