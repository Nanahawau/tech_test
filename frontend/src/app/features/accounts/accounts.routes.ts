import { Routes } from '@angular/router';

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/accounts-explorer/accounts-explorer.component').then(m => m.AccountsExplorerComponent)
  }
];