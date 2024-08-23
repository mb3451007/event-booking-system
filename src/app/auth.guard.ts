import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const isLoginroute = route.routeConfig?.path === 'login';
 
  if (token && isLoginroute) {
    console.log('Redirecting to home because token exists',token);
     router.navigate(['/'])
     return false
  
  } else if(!token  && !isLoginroute){
    console.log('Redirecting to login because no token',token);
    router.navigate(['/login']);
    return false;
    }

    return true;
  
};
