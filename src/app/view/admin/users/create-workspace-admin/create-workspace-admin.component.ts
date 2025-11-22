import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectauthentificationState, selectRoleState } from 'src/app/core/core.state';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { 
  createWorkspaceWithAdmin, 
  createWorkspaceWithAdminOk, 
  erreursAuthentification 
} from 'src/app/core/shared/stores/authentification/authentification.actions';
import { CreateWorkspaceWithAdminDto } from 'src/app/core/shared/dtos/create-workspace-admin-dto.modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { findAvailableRoles } from 'src/app/core/shared/stores/role/role.actions';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';

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
  
  roleState$!: Observable<RoleState>;
  isLoadingRoles: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private storeService: Store,
    private actionService: Actions,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {
    this.modalRef = bsModalRef;
  }

  ngOnInit() {
    this.authentificationState$ = this.storeService.select(selectauthentificationState).pipe();
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    this.initForm();
    this.loadRoles();
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
      adminEmail: ['', [Validators.required, Validators.email]],
      adminFirstName: ['', [Validators.required]],
      adminLastName: ['', [Validators.required]],
      adminRoleIds: [[], [Validators.required]]
    });
  }

  loadRoles() {
    this.isLoadingRoles = true;
    this.storeService.dispatch(findAvailableRoles({}));
    
    this.subscriptions.push(
      this.roleState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS) {
          this.isLoadingRoles = false;
        } else if (state.dataState === DataStateEnum.LOADING) {
          this.isLoadingRoles = true;
        } else if (state.dataState === DataStateEnum.ERROR) {
          this.isLoadingRoles = false;
        }
      })
    );
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

    // Créer le DTO avec les informations saisies
    const createWorkspaceWithAdminDto: CreateWorkspaceWithAdminDto = {
      workspace: {
        name: this.workspaceAdminForm.value.workspaceName,
        type: this.workspaceAdminForm.value.workspaceType,
        subscriptionPlan: this.workspaceAdminForm.value.subscriptionPlan
      },
      admin: {
        email: this.workspaceAdminForm.value.adminEmail,
        firstName: this.workspaceAdminForm.value.adminFirstName,
        lastName: this.workspaceAdminForm.value.adminLastName,
        roleIds: this.workspaceAdminForm.value.adminRoleIds || []
      }
    };

    console.log('Création Workspace avec nouvel Admin:', createWorkspaceWithAdminDto);
    this.storeService.dispatch(createWorkspaceWithAdmin({createWorkspaceWithAdminDto}));
  }

  closeModal() {
    this.bsModalRef.hide();
    this.workspaceAdminForm.reset();
    this.submitted = false;
  }
}

