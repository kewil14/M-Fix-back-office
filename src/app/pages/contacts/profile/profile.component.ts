import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectProfileState } from 'src/app/core/core.state';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { setUserProfile } from 'src/app/core/shared/stores/profile/profile.actions';
import { AuthentificationService } from 'src/app/core/shared/services/authentification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  breadCrumbItems!: Array<{}>;
  profileState$: Observable<ProfileState>;
  user$: Observable<any>;
  dataStateEnum = DataStateEnum;
  private subscriptions: Subscription[] = [];

  // Formulaire de changement de mot de passe
  changePasswordForm!: FormGroup;
  submittedChangePassword = false;
  isChangingPassword = false;
  changePasswordSuccess: string | null = null;
  changePasswordError: string | null = null;

  // Affichage / masquage des champs password
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private store: Store,
    private localStorageService: LocalStorageService,
    private formBuilder: UntypedFormBuilder,
    private authentificationService: AuthentificationService,
    private location: Location
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'MESSAGES.MENU.PROFILE' }, { label: 'MESSAGES.MENU.PROFILE', active: true }];
    
    this.profileState$ = this.store.select(selectProfileState);
    
    // Charger immédiatement depuis localStorage si le state est initial/vide
    const initSub = this.store.select(selectProfileState).pipe(
      take(1), // Prendre seulement la première valeur
      map(state => {
        // Si le state est initial ou vide, charger depuis localStorage
        if (state?.dataState === DataStateEnum.INITIAL || 
            !state?.user || 
            Object.keys(state.user || {}).length === 0) {
          const localUser = this.localStorageService.currentUserValue;
          if (localUser && Object.keys(localUser).length > 0) {
            // Dispatcher l'action pour mettre à jour le state
            this.store.dispatch(setUserProfile({ user: localUser }));
          }
        }
        return state;
      })
    ).subscribe();
    this.subscriptions.push(initSub);
    
    this.user$ = this.profileState$.pipe(
      map(state => {
        let userData = null;
        
        if (state?.user && state.user && Object.keys(state.user).length > 0) {
          userData = state.user;
        } else {
          const localUser = this.localStorageService.currentUserValue;
          if (localUser && Object.keys(localUser).length > 0) {
            userData = localUser;
            // Ne pas dispatcher ici car on l'a déjà fait ci-dessus
          }
        }
        
        if (userData) {
          const normalized = this.normalizeUser(userData);
          return normalized;
        }
        
        return null;
      })
    );

    this.initChangePasswordForm();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  normalizeUser(user: any): any {
    if (!user || Object.keys(user).length === 0) {
      return null;
    }
    return {
      id: user.id || user.userCode,
      userCode: user.userCode || user.id,
      email: user.email || user.userEmail,
      userEmail: user.userEmail || user.email,
      firstName: user.firstName || user.userFirstName || user.firstname,
      lastName: user.lastName || user.userLastName || user.lastname,
      userFirstName: user.userFirstName || user.firstName || user.firstname,
      userLastName: user.userLastName || user.lastName || user.lastname,
      firstname: user.firstName || user.userFirstName || user.firstname,
      lastname: user.lastName || user.userLastName || user.lastname,
      image: user.image || user.avatar,
      avatar: user.avatar || user.image,
      phoneNumber: user.phoneNumber || user.userPhoneNumber,
      userPhoneNumber: user.userPhoneNumber || user.phoneNumber,
      username: user.username,
      isActive: user.isActive,
      roles: Array.isArray(user.roles) ? user.roles : (user.roles ? [user.roles] : []),
      type: user.type,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      preferredLanguage: user.preferredLanguage,
      timezone: user.timezone
    };
  }

  getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return first + last || 'U';
  }

  hasRoles(user: any): boolean {
    return user?.roles && Array.isArray(user.roles) && user.roles.length > 0;
  }

  // --------- Changement de mot de passe ----------

  initChangePasswordForm(): void {
    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        // Au moins une minuscule, une majuscule, un chiffre et un caractère spécial
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

  get cp() { return this.changePasswordForm.controls; }

  onBack(): void {
    this.location.back();
  }

  onSubmitChangePassword(): void {
    this.submittedChangePassword = true;
    this.changePasswordSuccess = null;
    this.changePasswordError = null;

    if (!this.changePasswordForm || this.changePasswordForm.invalid) {
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    this.isChangingPassword = true;

    this.authentificationService.changePassword(oldPassword, newPassword).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        const apiMessage = res?.data?.message || res?.message;
        this.changePasswordSuccess = apiMessage || 'Mot de passe modifié avec succès.';
        this.changePasswordForm.reset();
        this.submittedChangePassword = false;
      },
      error: (error) => {
        this.isChangingPassword = false;
        this.changePasswordError = error?.error?.message || 'Erreur lors du changement de mot de passe.';
      }
    });
  }
}
