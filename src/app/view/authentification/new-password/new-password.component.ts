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
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  newPasswordForm!: FormGroup;
  submitted = false;
  token: string = '';

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
      this.token = params['token'] || '';
    });

    this.initForm();
    this.listenActions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm(): void {
    this.newPasswordForm = this.formBuilder.group({
      otp: ['', [Validators.required]],
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

    if (!this.token) {
      this.messages = { type: 'error', text: 'Token manquant. Veuillez utiliser le lien reçu par email.' };
      return;
    }

    if (this.newPasswordForm.invalid) {
      return;
    }

    const dto: ResetPasswordWithTokenDto = {
      token: this.token,
      otp: this.newPasswordForm.value.otp,
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


