import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogInComponent } from './components/log-in/log-in.component';
import { authGuard } from './auth.guard';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PackagesComponent } from './components/packages/packages.component';
import { PreCheckoutComponent } from './components/pre-checkout/pre-checkout.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ItemsModalComponent } from './components/items-modal/items-modal.component';

const routes: Routes = [
  { path: 'login', component: LogInComponent , canActivate:[authGuard]},
  { path: 'buy-package', component: PackagesComponent},
  { path: 'pre-checkout', component: PreCheckoutComponent},
  { path: 'checkout', component: CheckoutComponent},
  { path: 'package-preview', component: ItemsModalComponent},
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
