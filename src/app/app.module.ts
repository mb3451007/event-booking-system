import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainModule } from './components/main/main.module';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { PackagesComponent } from './components/packages/packages.component';
import { ItemsModalComponent } from './components/items-modal/items-modal.component';
import { PreCheckoutComponent } from './components/pre-checkout/pre-checkout.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { UpdateBookingComponent } from './components/update-booking/update-booking.component';
import { AddBookingComponent } from './components/add-booking/add-booking.component';
import { ViewBookingComponent } from './components/view-booking/view-booking.component';
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, PackagesComponent, ItemsModalComponent, PreCheckoutComponent, CheckoutComponent, UpdateBookingComponent, AddBookingComponent, ViewBookingComponent,],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MainModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
