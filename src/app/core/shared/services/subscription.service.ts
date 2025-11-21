import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';
import {
  SubscriptionResponseDto,
  SubscriptionPlanDto,
  UpgradeSubscriptionDto,
  DowngradeSubscriptionDto,
  BillingHistoryDto
} from '../dtos/subscription-response-dto';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {

  constructor(
    private http: HttpClient
  ) { }

  getSubscription(workspaceId: string): Observable<RequestResultDto<SubscriptionResponseDto>> {
    return this.http.get<RequestResultDto<SubscriptionResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/subscriptions/${workspaceId}/subscription`
    ).pipe(share());
  }

  upgradeSubscription(workspaceId: string, upgradeDto: UpgradeSubscriptionDto): Observable<RequestResultDto<SubscriptionResponseDto>> {
    return this.http.put<RequestResultDto<SubscriptionResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/subscriptions/${workspaceId}/subscription/upgrade`,
      upgradeDto
    ).pipe(share());
  }

  downgradeSubscription(workspaceId: string, downgradeDto: DowngradeSubscriptionDto): Observable<RequestResultDto<SubscriptionResponseDto>> {
    return this.http.put<RequestResultDto<SubscriptionResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/subscriptions/${workspaceId}/subscription/downgrade`,
      downgradeDto
    ).pipe(share());
  }

  renewSubscription(workspaceId: string): Observable<RequestResultDto<SubscriptionResponseDto>> {
    return this.http.post<RequestResultDto<SubscriptionResponseDto>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/subscriptions/${workspaceId}/subscription/renew`,
      {}
    ).pipe(share());
  }

  cancelSubscription(workspaceId: string): Observable<RequestResultDto<string>> {
    return this.http.post<RequestResultDto<string>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/subscriptions/${workspaceId}/subscription/cancel`,
      {}
    ).pipe(share());
  }

  getBillingHistory(workspaceId: string): Observable<RequestResultDto<BillingHistoryDto[]>> {
    return this.http.get<RequestResultDto<BillingHistoryDto[]>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/subscriptions/${workspaceId}/subscription/billing-history`
    ).pipe(share());
  }

  getAvailablePlans(): Observable<RequestResultDto<SubscriptionPlanDto[]>> {
    return this.http.get<RequestResultDto<SubscriptionPlanDto[]>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/plans`
    ).pipe(share());
  }

  comparePlans(planCodes: string[]): Observable<RequestResultDto<any>> {
    const params = new URLSearchParams();
    planCodes.forEach(code => params.append('plans', code));
    
    return this.http.get<RequestResultDto<any>>(
      API_URLS.WORKSPACE_SERVICE_URL + `/api/workspaces/plans/compare?${params.toString()}`
    ).pipe(share());
  }
}

