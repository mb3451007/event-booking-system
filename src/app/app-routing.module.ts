import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogInComponent } from './components/log-in/log-in.component';
import { authGuard } from './auth.guard';
import { PackagesComponent } from './components/packages/packages.component';

const routes: Routes = [
  { path: 'login', component: LogInComponent, canActivate: [authGuard] },
  { path: 'package-list', component: PackagesComponent },
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
