import { Component, OnInit, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfigService } from 'src/app/core/services/config.service';
import { EventService } from 'src/app/core/services/event.service';
import { ChartType } from './dashboard.model';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectDemandeState, selectProfileState } from 'src/app/core/core.state';
import { DemandeState } from 'src/app/core/shared/stores/demande/demande.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { DashboardService, UserStatisticsDto } from 'src/app/core/shared/services/dashboard.service';
import { UserTypeEnum } from 'src/app/core/config/list-roles';
import { map } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { setUserProfile } from 'src/app/core/shared/stores/profile/profile.actions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  modalRef?: BsModalRef;
  isVisible!: string;

  emailSentBarChart!: ChartType;
  monthlyEarningChart!: ChartType;
  transactions: any;
  statData: any;

  isActive!: string;

  profileState$: Observable<ProfileState>;
  demande$: Observable<DemandeState>;
  userStatistics$: Observable<UserStatisticsDto[]>;
  currentUser$: Observable<any>;
  isLoadingStats = false;
  statsError: string | null = null;

  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  userTypeEnum = UserTypeEnum;

  @ViewChild('content') content: any;
  constructor(
    private modalService: BsModalService, 
    private configService: ConfigService, 
    private eventService: EventService,
    private storeService: Store,
    private dashboardService: DashboardService,
    private localStorageService: LocalStorageService,
  ) {
  }

  ngOnInit() {
    this.profileState$ = this.storeService.select(selectProfileState);
    this.demande$ = this.storeService.select(selectDemandeState).pipe();

    this.currentUser$ = this.profileState$.pipe(
      map(state => {
        let userData = null;
        
        const stateUser = state?.user as any;
        if (stateUser && Object.keys(stateUser).length > 0 && (stateUser.id || stateUser.userCode || stateUser.userId)) {
          userData = stateUser;
        } else {
          const localUser = this.localStorageService.currentUserValue;
          if (localUser && Object.keys(localUser).length > 0) {
            userData = localUser;
            const currentStateUser = state?.user as any;
            if (!currentStateUser || !(currentStateUser.id || currentStateUser.userCode || currentStateUser.userId)) {
              this.storeService.dispatch(setUserProfile({ user: localUser }));
            }
          }
        }
        
        if (userData) {
          const normalized = this.normalizeUser(userData);
          return normalized;
        }
        
        return null;
      })
    );

    this.loadUserStatistics();

    const attribute = document.body.getAttribute('data-layout');
    this.isVisible = attribute || '';
    const vertical = document.getElementById('layout-vertical');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (attribute == 'horizontal') {
      const horizontal = document.getElementById('layout-horizontal');
      if (horizontal != null) {
        horizontal.setAttribute('checked', 'true');
        console.log(horizontal);
      }
    }

    this.fetchData();
  }

  normalizeUser(user: any): any {
    if (!user || Object.keys(user).length === 0) {
      return null;
    }
    
    const normalized = {
      id: user.id || user.userCode || user.userId,
      userCode: user.userCode || user.id || user.userId,
      userId: user.userId || user.id || user.userCode,
      email: user.email || user.userEmail,
      userEmail: user.userEmail || user.email,
      firstName: user.firstName || user.userFirstName || user.firstname,
      lastName: user.lastName || user.userLastName || user.lastname,
      userFirstName: user.userFirstName || user.firstName || user.firstname,
      userLastName: user.userLastName || user.lastName || user.lastname,
      firstname: user.firstName || user.userFirstName || user.firstname,
      lastname: user.lastName || user.userLastName || user.lastname,
      image: user.image || user.avatar,
      avatar: user.avatar || user.image,
      type: user.type,
      roles: user.roles || [],
      username: user.username,
      phoneNumber: user.phoneNumber || user.userPhoneNumber,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    };
    
    return normalized;
  }

  loadUserStatistics() {
    this.isLoadingStats = true;
    this.statsError = null;
    
    this.userStatistics$ = this.dashboardService.getUserStatistics().pipe(
      map(response => {
        this.isLoadingStats = false;
        if (response.status === 'SUCCESS' && response.data) {
          return response.data.userStatistics || [];
        } else {
          this.statsError = response.message || 'Failed to load statistics';
          return [];
        }
      })
    );

    this.userStatistics$.subscribe({
      error: (error) => {
        this.isLoadingStats = false;
        this.statsError = error?.error?.message || 'Error loading user statistics';
        console.error('Error loading user statistics:', error);
      }
    });
  }

  canViewUserType(userType: string, currentUserType?: string): boolean {
    if (!currentUserType) return false;
    
    switch (currentUserType) {
      case UserTypeEnum.SUPER_ADMIN:
        return true;
      case UserTypeEnum.ADMIN:
        return [
          UserTypeEnum.WORKSPACE_ADMIN,
          UserTypeEnum.SHOP_MANAGER,
          UserTypeEnum.EMPLOYEE,
          UserTypeEnum.TECHNICIAN,
          UserTypeEnum.DELIVERER
        ].includes(userType as UserTypeEnum);
      case UserTypeEnum.WORKSPACE_ADMIN:
        return [
          UserTypeEnum.SHOP_MANAGER,
          UserTypeEnum.EMPLOYEE,
          UserTypeEnum.TECHNICIAN,
          UserTypeEnum.DELIVERER
        ].includes(userType as UserTypeEnum);
      case UserTypeEnum.SHOP_MANAGER:
        return [
          UserTypeEnum.EMPLOYEE,
          UserTypeEnum.TECHNICIAN,
          UserTypeEnum.DELIVERER
        ].includes(userType as UserTypeEnum);
      default:
        return false;
    }
  }

  getUserTypeLabel(userType: string): string {
    const labels: { [key: string]: string } = {
      [UserTypeEnum.SUPER_ADMIN]: 'MESSAGES.ADMIN.USER_TYPES.SUPER_ADMIN',
      [UserTypeEnum.ADMIN]: 'MESSAGES.ADMIN.USER_TYPES.ADMIN',
      [UserTypeEnum.WORKSPACE_ADMIN]: 'MESSAGES.ADMIN.USER_TYPES.WORKSPACE_ADMIN',
      [UserTypeEnum.SHOP_MANAGER]: 'MESSAGES.ADMIN.USER_TYPES.SHOP_MANAGER',
      [UserTypeEnum.EMPLOYEE]: 'MESSAGES.ADMIN.USER_TYPES.EMPLOYEE',
      [UserTypeEnum.TECHNICIAN]: 'MESSAGES.ADMIN.USER_TYPES.TECHNICIAN',
      [UserTypeEnum.DELIVERER]: 'MESSAGES.ADMIN.USER_TYPES.DELIVERER',
      [UserTypeEnum.CUSTOMER]: 'MESSAGES.ADMIN.USER_TYPES.CUSTOMER'
    };
    return labels[userType] || userType;
  }

  getUserTypeIcon(userType: string): string {
    const icons: { [key: string]: string } = {
      [UserTypeEnum.SUPER_ADMIN]: 'ri-shield-star-line',
      [UserTypeEnum.ADMIN]: 'ri-admin-line',
      [UserTypeEnum.WORKSPACE_ADMIN]: 'ri-building-line',
      [UserTypeEnum.SHOP_MANAGER]: 'ri-store-line',
      [UserTypeEnum.EMPLOYEE]: 'ri-user-line',
      [UserTypeEnum.TECHNICIAN]: 'ri-tools-line',
      [UserTypeEnum.DELIVERER]: 'ri-truck-line',
      [UserTypeEnum.CUSTOMER]: 'ri-customer-service-line'
    };
    return icons[userType] || 'ri-user-line';
  }

  getTotalUsers(stats: UserStatisticsDto[]): number {
    if (!stats || stats.length === 0) {
      return 0;
    }
    return stats.reduce((sum, stat) => sum + (stat.count || 0), 0);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.openModal();
    }, 2000);
  }

  private fetchData() {
    this.emailSentBarChart = emailSentBarChart;
    this.monthlyEarningChart = monthlyEarningChart;

    this.isActive = 'year';
    this.configService.getConfig().subscribe(data => {
      this.transactions = data.transactions;
      this.statData = data.statData;
    });
  }

  openModal() {
    // this.modalRef = this.modalService.show(this.content, { class: 'center' });
  }

  weeklyreport() {
    this.isActive = 'week';
    this.emailSentBarChart.series =
      [{
        name: 'Demande',
         data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Devis',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, 
    ];
  }

  monthlyreport() {
    this.isActive = 'month';
    this.emailSentBarChart.series =
      [{
        name: 'Demande',
         data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Devis',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, 
    ];
  }

  yearlyreport() {
    this.isActive = 'year';
    this.emailSentBarChart.series =
      [{
        name: 'Demande',
         data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Devis',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, 
    ];
  }

  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
