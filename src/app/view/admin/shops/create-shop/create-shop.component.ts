import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectShopState } from 'src/app/core/core.state';
import { CreateShopDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { createShop, erreurShops, addShop } from 'src/app/core/shared/stores/shop/shop.actions';
import { ShopState } from 'src/app/core/shared/stores/shop/shop.state';
import { WorkspaceService } from 'src/app/core/shared/services/workspace.service';
import { WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { PermissionService } from 'src/app/core/shared/services/permission.service';

@Component({
  selector: 'app-create-shop',
  templateUrl: './create-shop.component.html',
  styleUrls: ['./create-shop.component.scss']
})
export class CreateShopComponent implements OnInit, OnDestroy {
  shopForm: FormGroup;
  submitted = false;
  
  shopState$!: Observable<ShopState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  modalRef?: BsModalRef;
  workspaces: WorkspaceDto[] = [];
  isLoadingWorkspaces: boolean = false;
  workspaceId: string | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private storeService: Store,
    private actionService: Actions,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private workspaceService: WorkspaceService,
    private translateService: TranslateService,
    private permissionService: PermissionService
  ) {
    this.modalRef = bsModalRef;
  }

  ngOnInit() {
    this.workspaceId = this.permissionService.getWorkspaceId();
    this.shopState$ = this.storeService.select(selectShopState).pipe();
    this.initForm();
    
    // Si l'utilisateur est Super Admin ou Admin, charger la liste des workspaces pour sélection
    if (this.permissionService.isSuperAdmin() || this.permissionService.isAdmin()) {
      this.loadWorkspaces();
    } else if (this.permissionService.isWorkspaceAdmin()) {
      // Workspace admin : utiliser son workspaceId et désactiver le champ
      if (this.workspaceId) {
        this.shopForm.patchValue({ workspaceId: this.workspaceId });
        this.shopForm.get('workspaceId')?.disable();
      }
    }
    this.actionShop();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.shopForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      workspaceId: ['', [Validators.required]],
      address: [''],
      city: [''],
      postalCode: [''],
      country: [''],
      phoneNumber: [''],
      email: ['', [Validators.email]],
      managerId: ['']
    });
  }

  loadWorkspaces() {
    this.isLoadingWorkspaces = true;
    // Utiliser getWorkspaces pour obtenir les vrais workspaces (espaces) et non les workspace admins
    this.workspaceService.getWorkspaces({ page: 0, size: 1000, isActive: true }).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data?.content) {
          // Convertir WorkspaceListResponseDto en WorkspaceDto[]
          this.workspaces = response.data.content.map((ws: any) => ({
            id: ws.id,
            name: ws.name,
            adminName: undefined
          }));
        } else {
          this.workspaces = [];
        }
        this.isLoadingWorkspaces = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des workspaces:', error);
        this.workspaces = [];
        this.isLoadingWorkspaces = false;
      }
    });
  }

  actionShop() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurShops)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addShop)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.SHOP_CREATE'), dismissible: false}
        );
        setTimeout(() => {
          this.modalRef?.hide();
        }, 1000);
      })
    );
  }

  get f() { return this.shopForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.shopForm.invalid) {
      return;
    }

    const workspaceId = this.workspaceId || this.shopForm.value.workspaceId;
    if (!workspaceId) {
      console.error('WorkspaceId is required');
      return;
    }

    const formValue = this.shopForm.value;
    const createShopDto: CreateShopDto = {
      name: formValue.name,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      postalCode: formValue.postalCode || undefined,
      country: formValue.country || undefined,
      phone: formValue.phoneNumber || undefined,
      phoneNumber: formValue.phoneNumber || undefined, // Pour compatibilité
      email: formValue.email || undefined,
      managerId: formValue.managerId || undefined
    };

    this.storeService.dispatch(createShop({ workspaceId, createShopDto }));
  }

  onCancel() {
    this.modalRef?.hide();
  }
}

