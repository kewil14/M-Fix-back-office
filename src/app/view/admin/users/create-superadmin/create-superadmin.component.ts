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
  createSuperAdmin, 
  createSuperAdminOk, 
  erreursAuthentification 
} from 'src/app/core/shared/stores/authentification/authentification.actions';
import { CreateSuperAdminDto } from 'src/app/core/shared/dtos/create-superadmin-dto.modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-superadmin',
  templateUrl: './create-superadmin.component.html',
  styleUrls: ['./create-superadmin.component.scss']
})
export class CreateSuperAdminComponent implements OnInit, OnDestroy {
  superAdminForm: FormGroup;
  submitted = false;
  
  authentificationState$!: Observable<AuthentificationState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  modalRef?: BsModalRef;

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
    this.initForm();
    this.actionSuperAdmin();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    this.superAdminForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]]
    });
  }

  get f() { return this.superAdminForm.controls; }

  actionSuperAdmin(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreursAuthentification)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),

      this.actionService.pipe(ofType(createSuperAdminOk)).subscribe(
        ({user}) => {
          console.log('SuperAdmin créé avec succès:', user);
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'SuperAdmin créé avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.bsModalRef.hide();
            this.superAdminForm.reset();
            this.submitted = false;
          }, 2000);
        }
      )
    );
  }

  onSubmit() {
    this.submitted = true;

    if (this.superAdminForm.invalid) {
      return;
    }

    const createSuperAdminDto: CreateSuperAdminDto = {
      email: this.superAdminForm.value.email,
      password: this.superAdminForm.value.password,
      firstName: this.superAdminForm.value.firstName,
      lastName: this.superAdminForm.value.lastName
    };

    console.log('Création SuperAdmin:', createSuperAdminDto);
    this.storeService.dispatch(createSuperAdmin({createSuperAdminDto}));
  }

  closeModal() {
    this.bsModalRef.hide();
    this.superAdminForm.reset();
    this.submitted = false;
  }
}

