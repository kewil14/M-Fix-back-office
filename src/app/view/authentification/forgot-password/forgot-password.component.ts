import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { sendTokenResetPassword } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { EmailDto } from 'src/app/core/shared/dtos/email-dto';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  submitted = false;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private storeService: Store
  ) {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Vérifier si un token est présent dans l'URL (lien depuis l'email)
    this.route.queryParams.subscribe(params => {
      const token = params['token'] || params['resetToken'] || '';
      console.log('[ForgotPasswordComponent] Query params:', params);
      console.log('[ForgotPasswordComponent] Token found:', token);
      
      if (token) {
        // Si un token est présent, rediriger vers la page reset-password avec le token
        console.log('[ForgotPasswordComponent] Redirecting to reset-password with token');
        this.router.navigate(['/auth/reset-password'], { 
          queryParams: { token: token },
          replaceUrl: true 
        });
      }
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.forgotForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const dto: EmailDto = { email: this.forgotForm.value.email };

    // On déclenche l'action NgRx, l'effet affiche les toasts
    this.storeService.dispatch(sendTokenResetPassword({ emailDto: dto }));

    // UX simple : on considère que l'effet gère les erreurs via toasts,
    // ici on peut juste afficher un message local et décocher le loading.
    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = 'Si un compte existe avec cet email, un message de réinitialisation a été envoyé.';
    }, 500);
  }
}


