import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, share } from 'rxjs';
import { API_URLS } from '../../config/app.url.config';
import { RequestResultDto } from '../dtos/request-result-dto.modal';

export interface UserStatisticsDto {
  userType: string;
  count: number;
  activeCount?: number;
  inactiveCount?: number;
}

export interface DashboardStatisticsDto {
  userStatistics: UserStatisticsDto[];
  totalUsers?: number;
  totalActiveUsers?: number;
  totalInactiveUsers?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getUserStatistics(): Observable<RequestResultDto<DashboardStatisticsDto>> {
    return this.http.get<RequestResultDto<DashboardStatisticsDto>>(
      `${API_URLS.CUSTOMERS_URL}/dashboard/user-statistics`
    ).pipe(share());
  }
}

