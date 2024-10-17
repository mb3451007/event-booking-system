import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from '../home-page/home-page.component';
import { AppRoutingModule } from './main-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from '../home-page/header/header.component';
import { FooterComponent } from '../home-page/footer/footer.component';
import { SideBarComponent } from '../home-page/side-bar/side-bar.component';
import { DashBoardComponent } from '../home-page/dash-board/dash-board.component';
import { ButtonPageComponent } from '../home-page/button-page/button-page.component';
import { NgChartsModule } from 'ng2-charts';
import { AlertPageComponent } from '../home-page/alert-page/alert-page.component';
import { BookingPageComponent } from '../home-page/booking-page/booking-page.component';
import { CustomerPageComponent } from '../home-page/customer-page/customer-page.component';
import { TransactionPageComponent } from '../home-page/transaction-page/transaction-page.component';
import { ItemsPageComponent } from '../home-page/items-page/items-page.component';
import { SubItemsPageComponent } from '../home-page/sub-items-page/sub-items-page.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderComponent } from '../home-page/loader/loader.component';
import { ConfirmationModalComponent } from '../home-page/confirmation-modal/confirmation-modal.component';
import { PeckagesComponent } from '../home-page/peckages/peckages.component';
import { PackageDetailsComponent } from '../home-page/package-details/package-details.component';
import { SettingComponent } from '../home-page/setting/setting.component';
import { QuillModule } from 'ngx-quill';
import { LogInComponent } from '../log-in/log-in.component';
import { ForgetPasswordComponent } from '../home-page/forget-password/forget-password.component';


@NgModule({
  declarations: [
    HomePageComponent,
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    DashBoardComponent,
    ButtonPageComponent,
    AlertPageComponent,
    BookingPageComponent,
    CustomerPageComponent,
    TransactionPageComponent,
    ItemsPageComponent,
    SubItemsPageComponent,
    LoaderComponent,
    PeckagesComponent,
    PackageDetailsComponent,
    ConfirmationModalComponent,
    SettingComponent,
    LogInComponent,
    ForgetPasswordComponent
  ],
  imports: [
    QuillModule.forRoot(), 
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgChartsModule,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    NgFor,
    AsyncPipe,
  ],
})
export class MainModule {}
