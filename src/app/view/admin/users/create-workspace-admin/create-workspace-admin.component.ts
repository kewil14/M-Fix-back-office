import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectauthentificationState, selectAdminState } from 'src/app/core/core.state';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { 
  createWorkspaceWithAdmin, 
  createWorkspaceWithAdminOk, 
  erreursAuthentification 
} from 'src/app/core/shared/stores/authentification/authentification.actions';
import { CreateWorkspaceWithAdminDto } from 'src/app/core/shared/dtos/create-workspace-admin-dto.modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AdminService } from 'src/app/core/shared/services/admin.service';
import { AdminListRequestDto } from 'src/app/core/shared/dtos/admin-list-request-dto';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { findAllAdmins } from 'src/app/core/shared/stores/admin/admin.actions';
import { AdminState } from 'src/app/core/shared/stores/admin/admin.state';

@Component({
  selector: 'app-create-workspace-admin',
  templateUrl: './create-workspace-admin.component.html',
  styleUrls: ['./create-workspace-admin.component.scss']
})
export class CreateWorkspaceAdminComponent implements OnInit, OnDestroy {
  workspaceAdminForm: FormGroup;
  submitted = false;
  
  authentificationState$!: Observable<AuthentificationState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  modalRef?: BsModalRef;

  workspaceTypes = ['REPAIR_SHOP', 'RETAIL', 'SERVICE'];
  subscriptionPlans = ['FREE', 'BASIC', 'PREMIUM'];
  
  adminState$!: Observable<AdminState>;
  admins: EmployeeResponseDto[] = [];
  isLoadingAdmins: boolean = false;
  selectedAdmin: EmployeeResponseDto | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private storeService: Store,
    private actionService: Actions,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private adminService: AdminService
  ) {
    this.modalRef = bsModalRef;
  }

  ngOnInit() {
    this.authentificationState$ = this.storeService.select(selectauthentificationState).pipe();
    this.adminState$ = this.storeService.select(selectAdminState).pipe();
    this.initForm();
    this.loadAdmins();
    this.actionWorkspaceAdmin();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    this.workspaceAdminForm = this.formBuilder.group({
      workspaceName: ['', [Validators.required]],
      workspaceType: ['REPAIR_SHOP', [Validators.required]],
      subscriptionPlan: ['PREMIUM', [Validators.required]],
      adminId: ['', [Validators.required]]
    });
  }

  loadAdmins() {
    this.isLoadingAdmins = true;
    const filters: AdminListRequestDto = {
      isActive: true,
      isSuperAdmin: false, // Exclure les super admins
      page: 0,
      size: 1000,
      sortBy: 'firstName',
      sortDirection: 'asc'
    };
    
    this.storeService.dispatch(findAllAdmins({ filters }));
    
    this.subscriptions.push(
      this.adminState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS) {
          this.admins = state.admins;
          this.isLoadingAdmins = false;
        } else if (state.dataState === DataStateEnum.LOADING) {
          this.isLoadingAdmins = true;
        } else if (state.dataState === DataStateEnum.ERROR) {
          this.isLoadingAdmins = false;
        }
      })
    );
  }

  onAdminChange(adminId: string) {
    this.selectedAdmin = this.admins.find(admin => admin.id === adminId) || null;
  }

  getAdminDisplayName(admin: EmployeeResponseDto): string {
    const name = `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
    return name ? `${name} (${admin.email})` : admin.email;
  }

  get f() { return this.workspaceAdminForm.controls; }

  actionWorkspaceAdmin(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreursAuthentification)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),

      this.actionService.pipe(ofType(createWorkspaceWithAdminOk)).subscribe(
        ({data}) => {
          console.log('Workspace et Admin créés avec succès:', data);
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: `Workspace "${data.workspaceName}" et Admin créés avec succès!`, dismissible: false}
          );
          setTimeout(() => {
            this.bsModalRef.hide();
            this.workspaceAdminForm.reset();
            this.submitted = false;
          }, 2000);
        }
      )
    );
  }

  onSubmit() {
    this.submitted = true;

    if (this.workspaceAdminForm.invalid) {
      return;
    }

    const selectedAdminId = this.workspaceAdminForm.value.adminId;
    const selectedAdmin = this.admins.find(admin => admin.id === selectedAdminId);
    
    if (!selectedAdmin) {
      this.messages$.next(
        {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: 'Admin sélectionné introuvable', dismissible: false}
      );
      return;
    }

    // Envoyer les informations de l'admin sélectionné au format attendu par l'endpoint
    const createWorkspaceWithAdminDto: CreateWorkspaceWithAdminDto = {
      workspace: {
        name: this.workspaceAdminForm.value.workspaceName,
        type: this.workspaceAdminForm.value.workspaceType,
        subscriptionPlan: this.workspaceAdminForm.value.subscriptionPlan
      },
      admin: {
        email: selectedAdmin.email,
        firstName: selectedAdmin.firstName,
        lastName: selectedAdmin.lastName,
        roleIds: selectedAdmin.roles?.map(role => role.id || '') || []
      },
      adminId: selectedAdminId  // Garder aussi l'ID pour référence
    };

    console.log('Création Workspace avec Admin existant:', createWorkspaceWithAdminDto);
    this.storeService.dispatch(createWorkspaceWithAdmin({createWorkspaceWithAdminDto}));
  }

  closeModal() {
    this.bsModalRef.hide();
    this.workspaceAdminForm.reset();
    this.submitted = false;
  }
}

