import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { take, filter, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectShopState } from 'src/app/core/core.state';
import { UpdateShopDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { findShopById, updateShop, setShop, erreurShops } from 'src/app/core/shared/stores/shop/shop.actions';
import { ShopState } from 'src/app/core/shared/stores/shop/shop.state';
import { PermissionService } from 'src/app/core/shared/services/permission.service';
import { WorkspaceService } from 'src/app/core/shared/services/workspace.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';

@Component({
  selector: 'app-shop-edit',
  templateUrl: './shop-edit.component.html',
  styleUrls: ['./shop-edit.component.scss']
})
export class ShopEditComponent implements OnInit, OnDestroy {
  shopForm: FormGroup;
  submitted = false;
  shopId: string | null = null;
  workspaceId: string | null = null;
  isInitializing = false;
  isShopLoaded = false;
  isUpdating = false;
  
  shopState$!: Observable<ShopState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  breadCrumbItems: Array<{}> = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private storeService: Store,
    private actionService: Actions,
    private translateService: TranslateService,
    private permissionService: PermissionService,
    private workspaceService: WorkspaceService,
    private shopService: ShopService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.ADMIN') },
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.SHOPS'), routerLink: '/admin/shops' },
      { label: this.translateService.instant('MESSAGES.ADMIN.SHOP.EDIT'), active: true }
    ];
    this.shopState$ = this.storeService.select(selectShopState).pipe();
    this.initForm();
    this.actionShop();
    
    // Subscription pour paramMap
    this.subscriptions.push(
      this.route.paramMap.pipe(take(1)).subscribe(params => {
        this.shopId = params.get('id');
        if (this.shopId) {
          this.initializeWorkspaceId();
        }
      })
    );

    // Subscription pour shopState$ avec guards pour éviter les boucles infinies
    this.subscriptions.push(
      this.shopState$.pipe(
        distinctUntilChanged((prev, curr) => {
          // Éviter les émissions inutiles si le shop n'a pas changé
          return prev.shop?.id === curr.shop?.id && 
                 prev.dataState === curr.dataState &&
                 prev.shops?.length === curr.shops?.length;
        })
      ).subscribe(state => {
        // Ne traiter que si on a un shopId
        if (!this.shopId) return;
        
        // Si le shop est chargé avec succès
        if (state.dataState === DataStateEnum.SUCCESS && state.shop && state.shop.id === this.shopId) {
          // Mettre à jour workspaceId depuis le shop si disponible
          if (state.shop.workspaceId && !this.workspaceId) {
            this.workspaceId = state.shop.workspaceId;
          }
          // Populate form seulement si pas déjà fait
          if (!this.isShopLoaded) {
            this.populateForm(state.shop);
            this.isShopLoaded = true;
          }
          return;
        }
        
        // Vérifier dans la liste des shops seulement si workspaceId n'est pas encore défini
        if (!this.workspaceId && state.shops && state.shops.length > 0) {
          const shopInList = state.shops.find(s => s.id === this.shopId);
          if (shopInList && shopInList.workspaceId) {
            this.workspaceId = shopInList.workspaceId;
            // Charger le shop seulement si pas déjà chargé
            if (!state.shop || state.shop.id !== this.shopId) {
              this.loadShop();
            }
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.shopForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      address: [''],
      city: [''],
      postalCode: [''],
      country: [''],
      phoneNumber: [''],
      email: ['', [Validators.email]],
      isActive: [true]
    });
  }

  populateForm(shop: any) {
    // Éviter de remplir le formulaire plusieurs fois
    if (this.isShopLoaded && this.shopForm.get('name')?.value) {
      return;
    }
    
    console.log('[ShopEdit] Populating form with shop data:', shop);
    this.shopForm.patchValue({
      name: shop.name || '',
      address: shop.address || '',
      city: shop.city || '',
      postalCode: shop.postalCode || '',
      country: shop.country || '',
      phoneNumber: shop.phoneNumber || shop.phone || '',
      email: shop.email || '',
      isActive: shop.isActive !== undefined ? shop.isActive : true
    });
    this.isShopLoaded = true;
    console.log('[ShopEdit] Form values after patch:', this.shopForm.value);
  }

  initializeWorkspaceId(): void {
    // Éviter les appels multiples
    if (this.isInitializing || this.workspaceId) {
      return;
    }
    this.isInitializing = true;

    // 1. Essayer depuis query params (une seule fois)
    this.subscriptions.push(
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        if (params['workspaceId']) {
          this.workspaceId = params['workspaceId'];
          this.isInitializing = false;
          this.loadShop();
          return;
        }
        
        // 2. Essayer depuis permission service (workspace admin)
        this.workspaceId = this.permissionService.getWorkspaceId();
        if (this.workspaceId) {
          this.isInitializing = false;
          this.loadShop();
          return;
        }
        
        // 3. Essayer depuis le state (si le shop est déjà chargé dans la liste)
        this.subscriptions.push(
          this.storeService.select(selectShopState).pipe(
            filter(state => state.shops && state.shops.length > 0),
            take(1)
          ).subscribe(state => {
            if (this.shopId) {
              const shopInList = state.shops.find(s => s.id === this.shopId);
              if (shopInList && shopInList.workspaceId) {
                this.workspaceId = shopInList.workspaceId;
                this.isInitializing = false;
                this.loadShop();
                return;
              }
            }
            
            // 4. Si super admin, chercher dans tous les workspaces
            if (this.permissionService.isSuperAdmin() && this.shopId && !this.workspaceId) {
              this.isInitializing = false;
              this.searchWorkspaceIdForSuperAdmin();
            } else if (!this.workspaceId) {
              this.isInitializing = false;
              console.error('WorkspaceId is required to load shop. ShopId:', this.shopId);
            }
          })
        );
      })
    );
  }

  searchWorkspaceIdForSuperAdmin(): void {
    if (!this.shopId || this.workspaceId) return;
    
    console.log('[ShopEdit] Super Admin: Searching for workspaceId for shop:', this.shopId);
    this.subscriptions.push(
      this.workspaceService.findAllWorkspaces().pipe(take(1)).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS' && response.data) {
            const workspaces = Array.isArray(response.data) ? response.data : [];
            // Chercher le shop dans chaque workspace
            this.searchWorkspaceIdSequentially(workspaces, 0);
          }
        },
        error: (error) => {
          console.error('[ShopEdit] Error loading workspaces for super admin:', error);
        }
      })
    );
  }

  searchWorkspaceIdSequentially(workspaces: any[], index: number): void {
    // Arrêter si workspaceId trouvé ou si on a fini
    if (this.workspaceId || index >= workspaces.length || !this.shopId) {
      if (!this.workspaceId && index >= workspaces.length) {
        console.error('[ShopEdit] Shop not found in any workspace');
      }
      return;
    }

    const workspace = workspaces[index];
    if (!workspace.id) {
      this.searchWorkspaceIdSequentially(workspaces, index + 1);
      return;
    }

    // Utiliser take(1) pour éviter les subscriptions multiples
    this.subscriptions.push(
      this.shopService.getShopById(workspace.id, this.shopId).pipe(take(1)).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS' && response.data && !this.workspaceId) {
            this.workspaceId = workspace.id;
            console.log('[ShopEdit] Found shop in workspace:', workspace.id);
            this.loadShop();
          } else if (!this.workspaceId) {
            // Essayer le workspace suivant
            this.searchWorkspaceIdSequentially(workspaces, index + 1);
          }
        },
        error: (error) => {
          // Si erreur 404, essayer le workspace suivant
          if (!this.workspaceId) {
            if (error.status === 404) {
              this.searchWorkspaceIdSequentially(workspaces, index + 1);
            } else {
              console.error('[ShopEdit] Error searching shop in workspace:', workspace.id, error);
              this.searchWorkspaceIdSequentially(workspaces, index + 1);
            }
          }
        }
      })
    );
  }

  loadShop(): void {
    // Éviter les appels multiples
    if (this.isShopLoaded) {
      return;
    }
    
    if (this.shopId && this.workspaceId) {
      console.log('[ShopEdit] Loading shop:', { shopId: this.shopId, workspaceId: this.workspaceId });
      this.storeService.dispatch(findShopById({ workspaceId: this.workspaceId, shopId: this.shopId }));
    } else {
      console.error('[ShopEdit] Cannot load shop - missing shopId or workspaceId:', { shopId: this.shopId, workspaceId: this.workspaceId });
    }
  }

  actionShop() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurShops)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(setShop)).subscribe(() => {
        // Ne rediriger que si c'est une mise à jour, pas un chargement initial
        if (this.isUpdating) {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.SHOP_UPDATE'), dismissible: false}
          );
          setTimeout(() => {
            this.router.navigate(['/admin/shops']);
          }, 1000);
          this.isUpdating = false;
        }
      })
    );
  }

  get f() { return this.shopForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.shopForm.invalid || !this.shopId || !this.workspaceId) {
      return;
    }

    // Marquer qu'on est en train de mettre à jour
    this.isUpdating = true;

    const formValue = this.shopForm.value;
    const updateShopDto: UpdateShopDto = {
      name: formValue.name,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      postalCode: formValue.postalCode || undefined,
      country: formValue.country || undefined,
      phone: formValue.phoneNumber || undefined,
      phoneNumber: formValue.phoneNumber || undefined, // Pour compatibilité
      email: formValue.email || undefined,
      isActive: formValue.isActive
    };

    this.storeService.dispatch(updateShop({ workspaceId: this.workspaceId, shopId: this.shopId, updateShopDto }));
  }

  onCancel() {
    this.router.navigate(['/admin/shops']);
  }

  onBack() {
    this.location.back();
  }
}

