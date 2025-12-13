import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription, of, map } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAdminState, selectRoleState, selectWorkspaceAdminState } from 'src/app/core/core.state';
import { UpdateAdminDto } from 'src/app/core/shared/dtos/update-admin-dto';
import {
  findAdminById,
  updateAdmin,
  erreurAdmins,
  setAdmin
} from 'src/app/core/shared/stores/admin/admin.actions';
import { AdminState } from 'src/app/core/shared/stores/admin/admin.state';
import { findAvailableRoles } from 'src/app/core/shared/stores/role/role.actions';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';
import { getTimezones } from 'src/app/core/shared/utils/timezone.util';
import { AvatarUploadService } from 'src/app/core/shared/services/avatar-upload.service';
import { MediaUrlService } from 'src/app/core/shared/services/media-url.service';
import { findWorkspaceAdminById, updateWorkspaceAdmin, setWorkspaceAdmin, erreurWorkspaceAdmins } from 'src/app/core/shared/stores/workspace-admin/workspace-admin.actions';
import { WorkspaceAdminState } from 'src/app/core/shared/stores/workspace-admin/workspace-admin.state';
import { UpdateWorkspaceAdminDto } from 'src/app/core/shared/dtos/update-workspace-admin-dto';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';

@Component({
  selector: 'app-admin-edit',
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.scss']
})
export class AdminEditComponent implements OnInit, OnDestroy {
  adminForm!: FormGroup;
  submitted = false;
  adminId: string | null = null;
  adminState$!: Observable<AdminState>;
  workspaceAdminState$!: Observable<WorkspaceAdminState>;
  roleState$!: Observable<RoleState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  breadCrumbItems: Array<{}> = [];
  formPopulated: boolean = false;
  isUpdating: boolean = false; // Flag pour distinguer le chargement initial de la mise à jour
  timezones = getTimezones(); // Liste des fuseaux horaires
  avatarPreview: string | null = null;
  avatarFile: File | null = null;
  isUploadingAvatar: boolean = false;
  isWorkspaceAdmin: boolean = false;
  currentAdmin: EmployeeResponseDto | null = null;

  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>( 
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  workspaces$: Observable<WorkspaceDto[]> = of([]);

  shops$: BehaviorSubject<ShopResponseDto[]> = new BehaviorSubject([]);

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private actionService: Actions,
    private avatarUploadService: AvatarUploadService,
    private mediaUrlService: MediaUrlService,
    private workspaceService: WorkspaceService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    const url = this.router.url;
    this.isWorkspaceAdmin = url.includes('/workspaces/');
    
    this.initForm(); // Initialise le formulaire avant les souscriptions
    // this.loadWorkspaces(); // COMMENTÉ - Charge les workspaces (non utilisé car champs workspace/shop commentés)

    if (this.isWorkspaceAdmin) {
      this.breadCrumbItems = [
        { label: 'Admin' },
        { label: 'Workspaces', routerLink: '/admin/workspaces' },
        { label: 'Modifier', active: true }
      ];
      this.workspaceAdminState$ = this.storeService.select(selectWorkspaceAdminState).pipe();
      this.subscriptions.push(
        this.workspaceAdminState$.subscribe(state => {
          console.log('WorkspaceAdminState update:', state);
          if (state.dataState === DataStateEnum.SUCCESS && state.workspaceAdmin && !this.formPopulated) {
            console.log('Populating form with workspace admin:', state.workspaceAdmin);
            this.populateForm(state.workspaceAdmin);
            this.formPopulated = true;
          }
        })
      );
    } else {
      this.breadCrumbItems = [
        { label: 'Admin' },
        { label: 'Administrateurs', routerLink: '/admin/admins' },
        { label: 'Modifier', active: true }
      ];
      this.adminState$ = this.storeService.select(selectAdminState).pipe();
      this.subscriptions.push(
        this.adminState$.subscribe(state => {
          console.log('AdminState update:', state);
          if (state.dataState === DataStateEnum.SUCCESS && state.admin && !this.formPopulated) {
            console.log('Populating form with admin:', state.admin);
            this.populateForm(state.admin);
            this.formPopulated = true;
          }
        })
      );
    }

    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    this.actionAdmin();
    
    this.storeService.dispatch(findAvailableRoles({}));

    this.route.paramMap.subscribe(params => {
      this.adminId = params.get('id');
      console.log('Admin ID from route:', this.adminId);
      if (this.adminId) {
        this.loadAdmin();
      }
    });

    // Subscribe to workspaceId changes to load shops - COMMENTÉ car les champs workspace et shop sont commentés
    // this.subscriptions.push(
    //   this.adminForm.get('workspaceId')?.valueChanges.subscribe(() => {
    //     this.onWorkspaceChange();
    //   })
    // );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    this.adminForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [''],
      avatar: [''],
      birthDate: [''],
      preferredLanguage: [''],
      timezone: [''],
      roleIds: [[]],
      // Champs workspace et shop commentés selon les spécifications
      // workspaceId: ['', [Validators.required]],
      // shopId: [{value: '', disabled: true}, [Validators.required]]
      workspaceId: [''],
      shopId: [{value: '', disabled: true}]
    });
    console.log('Admin form initialized:', this.adminForm);
  }

  populateForm(admin: EmployeeResponseDto): void {
    console.log('Entering populateForm with admin:', admin);
    this.currentAdmin = admin;
    this.adminForm.patchValue({
      email: admin.email || '',
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      phoneNumber: admin.phoneNumber || '',
      avatar: admin.avatar || '',
      birthDate: admin.birthDate ? new Date(admin.birthDate).toISOString().split('T')[0] : '',
      preferredLanguage: admin.preferredLanguage || '',
      timezone: admin.timezone || '',
      roleIds: admin.roles ? admin.roles.map((r: any) => r.id) : [],
      workspaceId: admin.workspaceId || '',
      shopId: admin.shopId || ''
    });
    
    if (admin.avatar) {
      this.avatarPreview = this.mediaUrlService.getMediaUrl(admin.avatar) || admin.avatar;
    }

    // If a workspaceId is present, load the shops for it - COMMENTÉ car les champs workspace et shop sont commentés
    // if (admin.workspaceId) {
    //   this.onWorkspaceChange(admin.workspaceId);
    // }
    console.log('Admin form after patchValue:', this.adminForm.value);
  }

  loadAdmin(): void {
    if (this.adminId) {
      if (this.isWorkspaceAdmin) {
        this.storeService.dispatch(findWorkspaceAdminById({ workspaceAdminId: this.adminId }));
      } else {
        this.storeService.dispatch(findAdminById({ adminId: this.adminId }));
      }
    }
  }

  loadWorkspaces(): void {
    this.workspaces$ = this.workspaceService.findAllWorkspaces().pipe(
      map(response => response.status === 'SUCCESS' ? response.data : [])
    );
  }

  onWorkspaceChange(preselectedWorkspaceId?: string): void {
    const workspaceId = preselectedWorkspaceId || this.f.workspaceId.value;
    const shopControl = this.f.shopId;
    
    this.shops$.next([]);
    shopControl.reset({value: '', disabled: true});

    if (workspaceId) {
      shopControl.enable();
      this.subscriptions.push(
        this.shopService.getShopsByWorkspace(workspaceId).subscribe(response => {
          if (response.status === 'SUCCESS') {
            this.shops$.next(response.data);
            // If a shop was preselected, patch its value after shops are loaded
            if (preselectedWorkspaceId && this.currentAdmin?.shopId) {
              shopControl.patchValue(this.currentAdmin.shopId);
            }
          }
        })
      );
    }
  }

  actionAdmin(): void {
    if (this.isWorkspaceAdmin) {
      this.subscriptions.push(
        this.actionService.pipe(ofType(erreurWorkspaceAdmins)).subscribe(({messages}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
          );
        }),
        this.actionService.pipe(ofType(setWorkspaceAdmin)).subscribe(() => {
          if (this.isUpdating) {
            this.messages$.next(
              {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Workspace admin mis à jour avec succès!', dismissible: false}
            );
            setTimeout(() => {
              this.router.navigate(['/admin/workspaces']);
            }, 1500);
            this.isUpdating = false;
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.actionService.pipe(ofType(erreurAdmins)).subscribe(({messages}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
          );
        }),
        this.actionService.pipe(ofType(setAdmin)).subscribe(() => {
          if (this.isUpdating) {
            this.messages$.next(
              {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Administrateur mis à jour avec succès!', dismissible: false}
            );
            setTimeout(() => {
              this.router.navigate(['/admin/admins']);
            }, 1500);
            this.isUpdating = false;
          }
        })
      );
    }
  }

  get f() { return this.adminForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.adminForm.invalid) {
      return;
    }

    if (!this.adminId) {
      return;
    }

    this.isUpdating = true;

    if (this.isWorkspaceAdmin) {
      const updateWorkspaceAdminDto: UpdateWorkspaceAdminDto = {
        email: this.adminForm.value.email,
        firstName: this.adminForm.value.firstName,
        lastName: this.adminForm.value.lastName,
        phoneNumber: this.adminForm.value.phoneNumber || undefined,
        avatar: this.adminForm.value.avatar || undefined,
        birthDate: this.adminForm.value.birthDate ? new Date(this.adminForm.value.birthDate).toISOString() : undefined,
        preferredLanguage: this.adminForm.value.preferredLanguage || undefined,
        timezone: this.adminForm.value.timezone || undefined,
        roleIds: this.adminForm.value.roleIds || [],
        // Champs workspace et shop commentés selon les spécifications
        // workspaceId: this.adminForm.value.workspaceId,
        // shopId: this.adminForm.value.shopId
        workspaceId: undefined,
        shopId: undefined
      };
      this.storeService.dispatch(updateWorkspaceAdmin({ workspaceAdminId: this.adminId, updateWorkspaceAdminDto }));
    } else {
      const updateAdminDto: UpdateAdminDto = {
        email: this.adminForm.value.email,
        firstName: this.adminForm.value.firstName,
        lastName: this.adminForm.value.lastName,
        phoneNumber: this.adminForm.value.phoneNumber || undefined,
        avatar: this.adminForm.value.avatar || undefined,
        birthDate: this.adminForm.value.birthDate ? new Date(this.adminForm.value.birthDate).toISOString() : undefined,
        preferredLanguage: this.adminForm.value.preferredLanguage || undefined,
        timezone: this.adminForm.value.timezone || undefined,
        roleIds: this.adminForm.value.roleIds || [],
        // Champs workspace et shop commentés selon les spécifications
        // workspaceId: this.adminForm.value.workspaceId,
        // shopId: this.adminForm.value.shopId
        workspaceId: undefined,
        shopId: undefined
      };
      this.storeService.dispatch(updateAdmin({ adminId: this.adminId, updateAdminDto }));
    }
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0] || event;
    if (file && file.type.startsWith('image/')) {
      this.avatarFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.uploadAvatar(file);
    }
  }

  onFileDropped(files: FileList | File[]): void {
    const fileArray = files instanceof FileList ? Array.from(files) : files;
    if (fileArray && fileArray.length > 0) {
      this.onFileSelected(fileArray[0]);
    }
  }

  uploadAvatar(file: File): void {
    this.isUploadingAvatar = true;
    const workspaceId = this.currentAdmin?.workspaceId || 'system';
    const entityId = this.adminId || undefined;
    const altText = `${this.adminForm.value.firstName || this.currentAdmin?.firstName || ''} ${this.adminForm.value.lastName || this.currentAdmin?.lastName || ''}`.trim() || 'Admin avatar';

    this.avatarUploadService.uploadAvatar(file, {
      entityType: 'USER',
      workspaceId,
      entityId,
      altText
    }).subscribe({
      next: (media) => {
        const mediaUrl = media?.cdnUrl || media?.fileName || '';
        if (mediaUrl) {
          this.adminForm.patchValue({ avatar: mediaUrl });
        }
        this.isUploadingAvatar = false;
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Avatar uploadé avec succès!', dismissible: true}
        );
      },
      error: (error) => {
        console.error('Erreur upload avatar:', error);
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: error?.error?.message || 'Erreur lors de l\'upload de l\'avatar', dismissible: false}
        );
        this.isUploadingAvatar = false;
      }
    });
  }

  removeAvatar(): void {
    this.avatarPreview = null;
    this.avatarFile = null;
    this.adminForm.patchValue({ avatar: '' });
  }

  onCancel(): void {
    this.router.navigate(['/admin/admins']);
  }
}