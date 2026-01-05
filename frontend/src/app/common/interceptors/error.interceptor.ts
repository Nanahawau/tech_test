import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        if (error.status === 401) {
          authService.logout();
          snackBar.open('Session expired. Please log in again.', 'Close', { duration: 5000 });
          return throwError(() => error);
        }

        if (error.status === 422 && error.error?.details) {
          const details = Array.isArray(error.error.details)
            ? error.error.details.map((e: any) => e.msg).join(', ')
            : error.error.details;
          errorMessage = `Validation error: ${details}`;
        } else if (error.error?.details) {
          errorMessage = error.error.details;
        } else {
          errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }

      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });

      return throwError(() => error);
    }),
  );
};
