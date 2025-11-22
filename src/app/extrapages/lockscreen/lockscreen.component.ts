import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectProfileState, selectauthentificationState } from 'src/app/core/core.state';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { connexion, connexionOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';

@Component({
  selector: 'app-lockscreen',
  templateUrl: './lockscreen.component.html',
  styleUrls: ['./lockscreen.component.scss']
})
export class LockscreenComponent implements OnInit, OnDestroy {
  year: number = new Date().getFullYear();
  unlockForm: FormGroup;
  submitted = false;
  error = '';
  isLoading = false;
  profileState$: Observable<ProfileState>;
  user$: Observable<any>;
  authentificationState$: Observable<AuthentificationState>;
  private subscriptions: Subscription[] = [];
  dataStateEnum = DataStateEnum;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private localStorageService: LocalStorageService
  ) {
    this.unlockForm = this.formBuilder.group({
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.profileState$ = this.store.select(selectProfileState);
    this.authentificationState$ = this.store.select(selectauthentificationState);
    
    this.user$ = this.profileState$.pipe(
      map(state => {
        if (state?.user && state.user && Object.keys(state.user).length > 0) {
          return this.normalizeUser(state.user);
        }
        const localUser = this.localStorageService.currentUserValue;
        if (localUser && Object.keys(localUser).length > 0) {
          return this.normalizeUser(localUser);
        }
        return null;
      })
    );

    this.subscriptions.push(
      this.actions$.pipe(ofType(connexionOk)).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/admin']);
      })
    );

    this.subscriptions.push(
      this.actions$.pipe(ofType(erreursAuthentification)).subscribe(({ messages }) => {
        this.isLoading = false;
        this.error = messages || 'Invalid password. Please try again.';
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get f() { 
    return this.unlockForm.controls; 
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
      username: user.username
    };
  }

  getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return first + last || 'U';
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.unlockForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.user$.pipe(take(1)).subscribe(user => {
      if (!user || !user.email) {
        this.error = 'User information not found. Please login again.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
        return;
      }

      const password = this.unlockForm.value.password;
      const loginDto = {
        email: user.email,
        password: password
      };

      this.store.dispatch(connexion({ loginDto }));
    });
  }
}
