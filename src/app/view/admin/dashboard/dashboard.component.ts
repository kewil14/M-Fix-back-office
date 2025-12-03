import { Component, OnInit, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfigService } from 'src/app/core/services/config.service';
import { EventService } from 'src/app/core/services/event.service';
import { ChartType } from './dashboard.model';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { Observable, forkJoin, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectDemandeState, selectProfileState } from 'src/app/core/core.state';
import { DemandeState } from 'src/app/core/shared/stores/demande/demande.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { DashboardService, UserStatisticsDto } from 'src/app/core/shared/services/dashboard.service';
import { UserTypeEnum } from 'src/app/core/config/list-roles';
import { map, catchError } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { setUserProfile } from 'src/app/core/shared/stores/profile/profile.actions';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService } from 'src/app/core/shared/services/workspace.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { WorkspaceAdminService } from 'src/app/core/shared/services/workspace-admin.service';
import { ProductService } from 'src/app/core/shared/services/product.service';

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

  // Workspaces et Shops
  workspacesCount: number = 0;
  shopsCount: number = 0;
  workspaceAdminsCount: number = 0;
  shopManagersCount: number = 0;
  isLoadingWorkspaces = false;
  isLoadingShops = false;

  // Produits
  productsCount: number = 0;
  activeProductsCount: number = 0;
  isLoadingProducts = false;

  // Permissions
  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;
  isWorkspaceAdmin: boolean = false;
  isShopManager: boolean = false;

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
    private permissionService: PermissionService,
    private workspaceService: WorkspaceService,
    private shopService: ShopService,
    private workspaceAdminService: WorkspaceAdminService,
    private productService: ProductService
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
    this.loadPermissions();
    this.loadWorkspacesAndShops();
    this.loadProductsStatistics();

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
          const stats = response.data.userStatistics || [];
          // Extraire les compteurs de workspace admins et shop managers depuis les statistiques
          const workspaceAdminStat = stats.find(s => s.userType === 'WORKSPACE_ADMIN');
          const shopManagerStat = stats.find(s => s.userType === 'SHOP_MANAGER');
          if (workspaceAdminStat) {
            this.workspaceAdminsCount = workspaceAdminStat.count || 0;
          }
          if (shopManagerStat) {
            this.shopManagersCount = shopManagerStat.count || 0;
          }
          console.log('[Dashboard] User statistics loaded:', { workspaceAdminsCount: this.workspaceAdminsCount, shopManagersCount: this.shopManagersCount });
          return stats;
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
    
    // Exclure WORKSPACE et SHOP des statistiques utilisateurs
    if (userType === 'WORKSPACE' || userType === 'SHOP') {
      return false;
    }
    
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
    // Exclure WORKSPACE et SHOP des statistiques utilisateurs
    return stats
      .filter(stat => stat.userType !== 'WORKSPACE' && stat.userType !== 'SHOP')
      .reduce((sum, stat) => sum + (stat.count || 0), 0);
  }

  loadPermissions(): void {
    this.isSuperAdmin = this.permissionService.isSuperAdmin();
    const userType = this.permissionService.getUserType();
    this.isAdmin = userType === 'ADMIN';
    this.isWorkspaceAdmin = this.permissionService.isWorkspaceAdmin();
    this.isShopManager = this.permissionService.isShopManager();
  }

  loadWorkspacesAndShops(): void {
    // Les workspace admins et shop managers sont chargés depuis loadUserStatistics()
    // Charger les workspaces et shops selon les permissions
    if (this.isSuperAdmin || this.isAdmin) {
      this.loadAllWorkspaces();
      this.loadAllShops();
    } else if (this.isWorkspaceAdmin) {
      // Workspace Admin voit seulement les shops de son workspace
      this.loadShopsForWorkspace();
    }
    // Shop Manager et employés ne voient ni workspaces ni shops
  }

  loadAllWorkspaces(): void {
    this.isLoadingWorkspaces = true;
    this.workspaceService.findAllWorkspaces().subscribe({
      next: (res) => {
        this.isLoadingWorkspaces = false;
        if (res && res.status === 'SUCCESS' && res.data) {
          this.workspacesCount = Array.isArray(res.data) ? res.data.length : 0;
          console.log('[Dashboard] Workspaces count:', this.workspacesCount);
        }
      },
      error: (err) => {
        this.isLoadingWorkspaces = false;
        console.error('[Dashboard] Error loading workspaces:', err);
      }
    });
  }

  loadAllShops(): void {
    this.isLoadingShops = true;
    this.shopService.getShops().subscribe({
      next: (res) => {
        this.isLoadingShops = false;
        if (res && res.status === 'SUCCESS' && res.data) {
          this.shopsCount = Array.isArray(res.data) ? res.data.length : 0;
          console.log('[Dashboard] Shops count:', this.shopsCount);
        }
      },
      error: (err) => {
        this.isLoadingShops = false;
        console.error('[Dashboard] Error loading shops:', err);
      }
    });
  }

  loadShopsForWorkspace(): void {
    this.isLoadingShops = true;
    const workspaceId = this.permissionService.getWorkspaceId();
    if (workspaceId) {
      this.shopService.getShops(workspaceId).subscribe({
        next: (res) => {
          this.isLoadingShops = false;
          if (res && res.status === 'SUCCESS' && res.data) {
            this.shopsCount = Array.isArray(res.data) ? res.data.length : 0;
            console.log('[Dashboard] Shops count for workspace:', this.shopsCount);
          }
        },
        error: (err) => {
          this.isLoadingShops = false;
          console.error('[Dashboard] Error loading shops for workspace:', err);
        }
      });
    } else {
      this.isLoadingShops = false;
    }
  }

  canViewWorkspaces(): boolean {
    return this.isSuperAdmin || this.isAdmin;
  }

  canViewShops(): boolean {
    return this.isSuperAdmin || this.isAdmin || this.isWorkspaceAdmin;
  }

  canViewProducts(): boolean {
    return this.isSuperAdmin || this.isAdmin || this.isWorkspaceAdmin || this.isShopManager;
  }

  loadProductsStatistics(): void {
    if (!this.canViewProducts()) {
      return;
    }

    this.isLoadingProducts = true;
    const params: any = {
      page: 1,
      page_size: 1, // On veut juste le total
      state: 'ACTIVE'
    };

    // Filtrer selon le rôle
    if (this.isWorkspaceAdmin) {
      const workspaceId = this.permissionService.getWorkspaceId();
      if (workspaceId) {
        params.workspace_id = workspaceId;
      }
    } else if (this.isShopManager) {
      const shopId = this.permissionService.getShopId();
      if (shopId) {
        params.shop_id = shopId;
      }
    }

    // Charger le total des produits actifs
    this.productService.getProducts(params).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.activeProductsCount = res.total || 0;
          // Charger aussi le total de tous les produits
          const allParams = { ...params };
          delete allParams.state;
          this.productService.getProducts(allParams).subscribe({
            next: (allRes) => {
              if (allRes && allRes.success) {
                this.productsCount = allRes.total || 0;
              }
              this.isLoadingProducts = false;
            },
            error: () => {
              this.isLoadingProducts = false;
            }
          });
        } else {
          this.isLoadingProducts = false;
        }
      },
      error: () => {
        this.isLoadingProducts = false;
      }
    });
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
