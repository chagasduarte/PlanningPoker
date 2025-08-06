import { CanActivateFn } from '@angular/router';

export const hasUserGuard: CanActivateFn = (route, state) => {
  if (typeof localStorage != 'undefined') {
      const jsonuser = localStorage.getItem("poker-user");
      if(jsonuser){
        return true;
      }
         
  }
  window.location.href = '/';
  alert("usuário não logado")
  return false;
};
