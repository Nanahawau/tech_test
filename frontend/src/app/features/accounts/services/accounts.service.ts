import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../../../common/models/api-response.model';
import { environment } from '../../../environments/environment';
import { Account, AccountQueryParams, AccountsPageDTO } from '../../../common/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private apiUrl = `${environment.apiBaseUrl}/api/insights/accounts`;

  constructor(private http: HttpClient) { }

  getAccounts(queryParams?: AccountQueryParams): Observable<AccountsPageDTO> {
  let params = new HttpParams();

  if (queryParams) {
    if (queryParams.page) {
      params = params.set('page', queryParams.page.toString());
    }
    if (queryParams.page_size) {
      params = params.set('page_size', queryParams.page_size.toString());
    }

    if (queryParams.account_uuid) {
      params = params.set('account_uuid', queryParams.account_uuid);
    }
    if (queryParams.status) {
      params = params.set('status', queryParams.status);
    }
    if (queryParams.search) {
      params = params.set('search', queryParams.search);
    }
    if (queryParams.workflow_title) {
      params = params.set('workflow_title', queryParams.workflow_title);
    }
    if (queryParams.sort_by) {
      params = params.set('sort_by', queryParams.sort_by);
    }
    if (queryParams.sort_dir) {
      params = params.set('sort_dir', queryParams.sort_dir);
    }
  }

  return this.http.get<ApiSuccessResponse<AccountsPageDTO>>(this.apiUrl, { params }).pipe(
    map(response => response.data)
  );
}

   getAccountById(accountUuid: string): Observable<Account> {
    return this.http.get<ApiSuccessResponse<Account>>(`${this.apiUrl}/${accountUuid}`).pipe(
      map(response => response.data)
    );
  }
}