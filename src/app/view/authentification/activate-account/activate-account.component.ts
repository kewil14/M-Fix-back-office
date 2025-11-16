import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { APP_COLORS, APP_ENUMS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { 
  validateActivationToken, 
  validateActivationTokenOk,
  activateAccountWithToken,
  activateAccountWithTokenOk,
  erreursAuthentification 
} from 'src/app/core/shared/stores/authentification/authentification.actions';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { selectauthentificationState } from 'src/app/core/core.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { APP_LINK } from 'src/app/core/config/app.url.config';
import { ValidateTokenResponseDto } from 'src/app/core/shared/dtos/validate-token-response-dto.modal';
import { ActivateAccountDto } from 'src/app/core/shared/dtos/activate-account-dto.modal';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent implements OnInit, OnDestroy {
  activateForm: FormGroup;
  submitted = false;
  error = '';
  fieldTextType: boolean = false;
  confirmPasswordFieldTextType: boolean = false;
  token: string = '';
  tokenData: ValidateTokenResponseDto | null = null;
  isValidatingToken = false;
  isTokenValid = false;

  // Propriétés pour les images et styles
  servicesImage = '../../../../assets/images/bg-for white place.png';
  backgroundClass = 'bg-with-image';
  animationState = 'in';

  app_enum: typeof APP_ENUMS = APP_ENUMS;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;

  subscriptions: Subscription[] = [];
  authentificationState$!: Observable<AuthentificationState>;

  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  // set the current year
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private actionService: Actions,
    private storeService: Store,
  ) { }

  ngOnInit() {
    this.authentificationState$ = this.storeService.select(selectauthentificationState).pipe();

    // Récupérer le token depuis les query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.validateToken();
      } else {
        this.messages$.next({
          type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, 
          title: APP_COLORS.DANGER, 
          message: 'Token manquant dans l\'URL', 
          dismissible: false
        });
      }
    });

    this.initActivateForm();
    this.actionAuthentification();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initActivateForm(): void {
    this.activateForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // convenience getter for easy access to form fields
  get f() { return this.activateForm.controls; }

  validateToken(): void {
    if (!this.token) {
      return;
    }
    
    this.isValidatingToken = true;
    this.storeService.dispatch(validateActivationToken({token: this.token}));
  }

  // capture des differentes actions
  actionAuthentification(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreursAuthentification)).subscribe(({messages}) => {
        this.isValidatingToken = false;
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),

      this.actionService.pipe(ofType(validateActivationTokenOk)).subscribe(
        ({tokenData}) => {
          console.log('Token validé avec succès:', tokenData);
          this.isValidatingToken = false;
          this.isTokenValid = true;
          this.tokenData = tokenData;
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Token valide. Veuillez définir votre mot de passe.', dismissible: false}
          );
        }
      ),

      this.actionService.pipe(ofType(activateAccountWithTokenOk)).subscribe(
        () => {
          console.log('Compte activé avec succès');
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Compte activé avec succès. Redirection vers la page de connexion...', dismissible: false}
          );
          
          setTimeout(() => {
            this.router.navigateByUrl(APP_LINK.LINK_AUTH_LOGIN);
          }, 2000);
        }
      )
    );
  }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.activateForm.invalid) {
      return;
    }

    if (!this.isTokenValid) {
      this.messages$.next({
        type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, 
        title: APP_COLORS.DANGER, 
        message: 'Le token n\'est pas valide', 
        dismissible: false
      });
      return;
    }

    const activateAccountDto: ActivateAccountDto = {
      token: this.token,
      newPassword: this.activateForm.value.newPassword
    };

    console.log('Activation du compte avec:', activateAccountDto);
    this.storeService.dispatch(activateAccountWithToken({activateAccountDto}));
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleConfirmPasswordFieldTextType() {
    this.confirmPasswordFieldTextType = !this.confirmPasswordFieldTextType;
  }
}

