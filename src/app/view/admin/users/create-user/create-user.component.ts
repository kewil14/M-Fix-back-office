import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectUserState } from 'src/app/core/core.state';
import { UserState } from 'src/app/core/shared/stores/user/user.state';
import { 
  createUser,
  addUser,
  erreurUsers
} from 'src/app/core/shared/stores/user/user.actions';
import { UserRequestDto } from 'src/app/core/shared/dtos/user-request-dto.modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserTypeEnum, CountryEnum } from 'src/app/core/config/list-roles';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  submitted = false;
  
  userState$!: Observable<UserState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  modalRef?: BsModalRef;
  CountryEnum = CountryEnum;
  UserTypeEnum = UserTypeEnum;

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
    this.userState$ = this.storeService.select(selectUserState).pipe();
    this.initForm();
    this.actionUser();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      userFirstName: ['', [Validators.required]],
      userLastName: ['', [Validators.required]],
      userEmail: ['', [Validators.required, Validators.email]],
      userPhoneNumber: ['', [Validators.required]],
      country: [CountryEnum.FRANCE, [Validators.required]],
      userType: [UserTypeEnum.CUSTOMER, [Validators.required]]
    });
  }

  get f() { return this.userForm.controls; }

  actionUser(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurUsers)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),

      this.actionService.pipe(ofType(addUser)).subscribe(
        ({user}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Utilisateur créé avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.bsModalRef.hide();
            this.userForm.reset();
            this.submitted = false;
          }, 2000);
        }
      )
    );
  }

  onSubmit() {
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }

    const userRequestDto: UserRequestDto = {
      userFirstName: this.userForm.value.userFirstName,
      userLastName: this.userForm.value.userLastName,
      userEmail: this.userForm.value.userEmail,
      userPhoneNumber: this.userForm.value.userPhoneNumber,
      country: this.userForm.value.country,
      userType: this.userForm.value.userType,
      userPassword: 'TempPassword123!',
      image: ''
    };

    this.storeService.dispatch(createUser({user: userRequestDto}));
  }

  closeModal() {
    this.bsModalRef.hide();
    this.userForm.reset();
    this.submitted = false;
  }
}

