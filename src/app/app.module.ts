import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainModule } from './components/main/main.module';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LogInComponent } from './components/log-in/log-in.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingComponent } from './components/home-page/setting/setting.component';
import { ToastrModule } from 'ngx-toastr';





@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    LogInComponent,
    SettingComponent,
  
  ],
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
