import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAdminState, selectRoleState } from 'src/app/core/core.state';
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

  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private actionService: Actions,
    private avatarUploadService: AvatarUploadService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Admin' },
      { label: 'Administrateurs', routerLink: '/admin/admins' },
      { label: 'Modifier', active: true }
    ];

    this.adminState$ = this.storeService.select(selectAdminState).pipe();
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    this.initForm();
    this.actionAdmin();
    
    // Charger les rôles disponibles
    this.storeService.dispatch(findAvailableRoles({}));

    this.route.paramMap.subscribe(params => {
      this.adminId = params.get('id');
      if (this.adminId) {
        this.loadAdmin();
      }
    });

    // Écouter les changements d'état pour remplir le formulaire
    this.subscriptions.push(
      this.adminState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.admin && !this.formPopulated) {
          this.populateForm(state.admin);
          this.formPopulated = true;
        }
      })
    );
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
      roleIds: [[]]
    });
  }

  populateForm(admin: any): void {
    this.adminForm.patchValue({
      email: admin.email || '',
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      phoneNumber: admin.phoneNumber || '',
      avatar: admin.avatar || '',
      birthDate: admin.birthDate ? new Date(admin.birthDate).toISOString().split('T')[0] : '',
      preferredLanguage: admin.preferredLanguage || '',
      timezone: admin.timezone || '',
      roleIds: admin.roles ? admin.roles.map((r: any) => r.id) : []
    });
    
    // Afficher le preview de l'avatar existant
    if (admin.avatar) {
      this.avatarPreview = admin.avatar;
    }
  }

  loadAdmin(): void {
    if (this.adminId) {
      this.storeService.dispatch(findAdminById({ adminId: this.adminId }));
    }
  }

  actionAdmin(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurAdmins)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(setAdmin)).subscribe(() => {
        // Ne rediriger que si c'est une mise à jour (après soumission), pas lors du chargement initial
        if (this.isUpdating) {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Administrateur mis à jour avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.router.navigate(['/admin/admins']);
          }, 1500);
          this.isUpdating = false; // Réinitialiser le flag
        }
      })
    );
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

    // Marquer qu'on est en train de mettre à jour
    this.isUpdating = true;

    const updateAdminDto: UpdateAdminDto = {
      email: this.adminForm.value.email,
      firstName: this.adminForm.value.firstName,
      lastName: this.adminForm.value.lastName,
      phoneNumber: this.adminForm.value.phoneNumber || undefined,
      avatar: this.adminForm.value.avatar || undefined,
      birthDate: this.adminForm.value.birthDate ? new Date(this.adminForm.value.birthDate).toISOString() : undefined,
      preferredLanguage: this.adminForm.value.preferredLanguage || undefined,
      timezone: this.adminForm.value.timezone || undefined,
      roleIds: this.adminForm.value.roleIds || []
    };

    this.storeService.dispatch(updateAdmin({ adminId: this.adminId, updateAdminDto }));
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0] || event;
    if (file && file.type.startsWith('image/')) {
      this.avatarFile = file;
      
      // Créer un preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Uploader le fichier
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
    this.avatarUploadService.uploadAvatar(file).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data?.url) {
          this.adminForm.patchValue({ avatar: response.data.url });
          this.isUploadingAvatar = false;
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Avatar uploadé avec succès!', dismissible: true}
          );
        } else {
          this.messages$.next(
            {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: response.message || 'Erreur lors de l\'upload de l\'avatar', dismissible: false}
          );
          this.isUploadingAvatar = false;
        }
      },
      error: (error) => {
        console.error('Erreur upload avatar:', error);
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: 'Erreur lors de l\'upload de l\'avatar', dismissible: false}
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

