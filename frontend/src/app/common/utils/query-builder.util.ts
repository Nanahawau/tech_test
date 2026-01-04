import { HttpParams } from '@angular/common/http';
import { AccountQueryParams } from '../models/account.model';

export class QueryBuilder {
  /**
   * Build query params for accounts endpoint
   * Keeps query param logic DRY and typed
   */
  static buildAccountsQuery(params: AccountQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.workflow_title) httpParams = httpParams.set('workflow_title', params.workflow_title);
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_dir) httpParams = httpParams.set('sort_dir', params.sort_dir);

    return httpParams;
  }
}