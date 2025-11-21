import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectShopState } from 'src/app/core/core.state';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { findShopById } from 'src/app/core/shared/stores/shop/shop.actions';
import { ShopState } from 'src/app/core/shared/stores/shop/shop.state';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';

@Component({
  selector: 'app-shop-detail',
  templateUrl: './shop-detail.component.html',
  styleUrls: ['./shop-detail.component.scss']
})
export class ShopDetailComponent implements OnInit, OnDestroy {
  shopState$!: Observable<ShopState>;
  shop: ShopResponseDto | null = null;
  shopId: string | null = null;
  workspaceId: string | null = null;
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private storeService: Store,
    private translateService: TranslateService,
    private permissionService: PermissionService,
    private shopService: ShopService,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.ADMIN') },
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.SHOPS'), routerLink: '/admin/shops' },
      { label: this.translateService.instant('MESSAGES.ADMIN.SHOP.DETAILS'), active: true }
    ];
    
    this.shopState$ = this.storeService.select(selectShopState).pipe();
    
    // Récupérer shopId depuis les paramètres de route
    this.route.paramMap.subscribe(params => {
      this.shopId = params.get('id');
      if (this.shopId) {
        this.initializeWorkspaceId();
      }
    });
    
    // Écouter les changements du state pour mettre à jour le shop
    this.subscriptions.push(
      this.shopState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.shop) {
          if (state.shop.id === this.shopId) {
            this.shop = state.shop;
            // Mettre à jour workspaceId depuis le shop si disponible
            if (state.shop.workspaceId && !this.workspaceId) {
              this.workspaceId = state.shop.workspaceId;
            }
          }
        }
        // Vérifier aussi dans la liste des shops
        if (state.shops && state.shops.length > 0 && this.shopId && !this.workspaceId) {
          const shopInList = state.shops.find(s => s.id === this.shopId);
          if (shopInList && shopInList.workspaceId) {
            this.workspaceId = shopInList.workspaceId;
            if (!this.shop) {
              this.loadShop();
            }
          }
        }
      })
    );
  }
  
  initializeWorkspaceId(): void {
    // 1. Essayer depuis query params
    this.route.queryParams.subscribe(params => {
      if (params['workspaceId']) {
        this.workspaceId = params['workspaceId'];
        this.loadShop();
        return;
      }
      
      // 2. Essayer depuis permission service (workspace admin)
      this.workspaceId = this.permissionService.getWorkspaceId();
      if (this.workspaceId) {
        this.loadShop();
        return;
      }
      
      // 3. Essayer depuis le state (si le shop est déjà chargé dans la liste)
      this.storeService.select(selectShopState).subscribe(state => {
        if (state.shops && state.shops.length > 0 && this.shopId) {
          const shopInList = state.shops.find(s => s.id === this.shopId);
          if (shopInList && shopInList.workspaceId) {
            this.workspaceId = shopInList.workspaceId;
            this.loadShop();
            return;
          }
        }
        
        // 4. Si super admin, chercher dans tous les workspaces
        if (this.permissionService.isSuperAdmin() && this.shopId && !this.workspaceId) {
          this.searchWorkspaceIdForSuperAdmin();
        } else if (!this.workspaceId) {
          console.error('WorkspaceId is required to load shop. ShopId:', this.shopId);
        }
      }).unsubscribe(); // Unsubscribe après la première émission
    });
  }
  
  searchWorkspaceIdForSuperAdmin(): void {
    if (!this.shopId) return;
    
    console.log('Super Admin: Searching for workspaceId for shop:', this.shopId);
    this.workspaceService.getWorkspaces({ page: 0, size: 1000, isActive: true }).subscribe({
      next: async (response) => {
        if (response.status === 'SUCCESS' && response.data?.content) {
          const workspaces = response.data.content;
          // Chercher le shop dans chaque workspace de manière séquentielle
          await this.searchWorkspaceIdSequentially(workspaces);
        }
      },
      error: (error) => {
        console.error('Error loading workspaces for super admin:', error);
      }
    });
  }
  
  private async searchWorkspaceIdSequentially(workspaces: any[]): Promise<void> {
    for (const workspace of workspaces) {
      try {
        const shopResponse = await firstValueFrom(
          this.shopService.getShops(workspace.id).pipe(
            catchError(() => {
              // Ignorer les erreurs pour les workspaces qui n'ont pas de shops
              return of(null);
            })
          )
        );
        
        if (shopResponse?.status === 'SUCCESS' && shopResponse.data) {
          const shop = shopResponse.data.find((s: ShopResponseDto) => s.id === this.shopId);
          if (shop && shop.workspaceId) {
            this.workspaceId = shop.workspaceId;
            console.log('Found shop in workspace:', workspace.id);
            this.loadShop();
            return;
          }
        }
      } catch (error) {
        // Continuer avec le workspace suivant
        console.debug('Error checking workspace:', workspace.id, error);
      }
    }
    
    if (!this.workspaceId) {
      console.error('Shop not found in any workspace. ShopId:', this.shopId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadShop(): void {
    if (!this.shopId) {
      console.error('ShopId is required to load shop');
      return;
    }
    
    if (!this.workspaceId) {
      // Essayer de récupérer depuis le permission service
      this.workspaceId = this.permissionService.getWorkspaceId();
      if (!this.workspaceId) {
        console.error('WorkspaceId is required to load shop. ShopId:', this.shopId);
        return;
      }
    }
    
    console.log('Loading shop with workspaceId:', this.workspaceId, 'shopId:', this.shopId);
    this.storeService.dispatch(findShopById({ workspaceId: this.workspaceId, shopId: this.shopId }));
  }

  onEdit(): void {
    if (this.shopId) {
      this.router.navigate(['/admin/shops/edit', this.shopId], {
        queryParams: { workspaceId: this.workspaceId }
      });
    }
  }

  hasOpeningHours(): boolean {
    if (!this.shop?.openingHours) {
      return false;
    }
    return Object.keys(this.shop.openingHours).length > 0;
  }

  getOpeningHoursArray(): Array<{day: string, hours: string}> {
    if (!this.shop?.openingHours) {
      return [];
    }
    
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return dayKeys.map((key, index) => ({
      day: days[index],
      hours: this.shop?.openingHours?.[key] || ''
    }));
  }
}

