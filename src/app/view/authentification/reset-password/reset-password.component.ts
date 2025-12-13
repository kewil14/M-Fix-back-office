import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { resetPasswordAction, resetPasswordActionOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { ResetPasswordWithTokenDto } from 'src/app/core/shared/dtos/reset-password-with-token-dto.modal';
import { APP_LINK } from 'src/app/core/config/app.url.config';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  newPasswordForm!: FormGroup;
  submitted = false;
  token: string = '';
  showOtpField: boolean = true; // Afficher le champ OTP par défaut

  dataStateEnum = DataStateEnum;
  isProcessing = false;

  messages: { type: 'success' | 'error'; text: string } | null = null;

  showPassword = false;
  showConfirmPassword = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private actionService: Actions,
    private storeService: Store
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || params['resetToken'] || '';
      console.log('[ResetPasswordComponent] Query params:', params);
      console.log('[ResetPasswordComponent] Token extracted:', this.token ? 'Token présent' : 'Token absent');
      
      // Si le token existe dans l'URL, ne pas demander l'OTP
      // Sinon, l'OTP est requis
      this.showOtpField = !this.token;
      
      // Réinitialiser le formulaire avec la bonne validation
      this.initForm();
    });

    this.listenActions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    // Si le token existe, l'OTP n'est pas requis
    // Sinon, l'OTP est requis
    const otpValidators = this.showOtpField ? [Validators.required] : [];
    
    this.newPasswordForm = this.formBuilder.group({
      otp: ['', otpValidators],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
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

  get f() { return this.newPasswordForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.messages = null;

    // Vérifier si le token ou l'otp existe, sinon renvoyer une erreur
    const otp = this.newPasswordForm.value.otp?.trim() || '';
    if (!this.token && !otp) {
      this.messages = { 
        type: 'error', 
        text: 'Token ou OTP manquant. Veuillez utiliser le lien reçu par email ou fournir un OTP valide.' 
      };
      return;
    }

    if (this.newPasswordForm.invalid) {
      return;
    }

    const dto: ResetPasswordWithTokenDto = {
      token: this.token || '',
      otp: otp || '',
      newPassword: this.newPasswordForm.value.newPassword
    };

    this.isProcessing = true;
    this.storeService.dispatch(resetPasswordAction({ resetPasswordDto: dto }));
  }

  listenActions(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(resetPasswordActionOk)).subscribe(({ msg }) => {
        this.isProcessing = false;
        this.messages = {
          type: 'success',
          text: msg || 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
        };

        setTimeout(() => {
          this.router.navigateByUrl(APP_LINK.LINK_AUTH_LOGIN);
        }, 2000);
      }),
      this.actionService.pipe(ofType(erreursAuthentification)).subscribe(({ messages }) => {
        this.isProcessing = false;
        this.messages = {
          type: 'error',
          text: messages || 'Erreur lors de la réinitialisation du mot de passe.'
        };
      })
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}


