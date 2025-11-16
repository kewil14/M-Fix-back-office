import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectauthentificationState } from 'src/app/core/core.state';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { 
  createAdminNew,
  addAdmin,
  erreurAdmins
} from 'src/app/core/shared/stores/admin/admin.actions';
import { CreateAdminDto } from 'src/app/core/shared/dtos/create-admin-dto.modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AvatarUploadService } from 'src/app/core/shared/services/avatar-upload.service';

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.scss']
})
export class CreateAdminComponent implements OnInit, OnDestroy {
  adminForm: FormGroup;
  submitted = false;
  
  authentificationState$!: Observable<AuthentificationState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  modalRef?: BsModalRef;
  avatarPreview: string | null = null;
  avatarFile: File | null = null;
  isUploadingAvatar: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private storeService: Store,
    private actionService: Actions,
    public modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private avatarUploadService: AvatarUploadService
  ) {
    this.modalRef = bsModalRef;
  }

  ngOnInit() {
    this.authentificationState$ = this.storeService.select(selectauthentificationState).pipe();
    this.initForm();
    this.actionAdmin();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    this.adminForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      isSuperAdmin: [false],
      avatar: ['']
    });
  }

  get f() { return this.adminForm.controls; }

  actionAdmin(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurAdmins)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),

      this.actionService.pipe(ofType(addAdmin)).subscribe(
        ({admin}) => {
          console.log('Admin créé avec succès:', admin);
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Admin créé avec succès! Un email d\'invitation a été envoyé.', dismissible: false}
          );
          setTimeout(() => {
            this.bsModalRef.hide();
            this.adminForm.reset();
            this.submitted = false;
          }, 2000);
        }
      )
    );
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

  onSubmit() {
    this.submitted = true;

    if (this.adminForm.invalid) {
      return;
    }

    const createAdminDto: CreateAdminDto = {
      email: this.adminForm.value.email,
      firstName: this.adminForm.value.firstName,
      lastName: this.adminForm.value.lastName,
      isSuperAdmin: this.adminForm.value.isSuperAdmin || false,
      roleIds: [],
      avatar: this.adminForm.value.avatar || undefined
    };

    console.log('Création Admin:', createAdminDto);
    this.storeService.dispatch(createAdminNew({createAdminDto}));
  }

  closeModal() {
    this.bsModalRef.hide();
    this.adminForm.reset();
    this.submitted = false;
  }
}

