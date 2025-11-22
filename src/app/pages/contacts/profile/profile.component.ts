import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectProfileState } from 'src/app/core/core.state';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { setUserProfile } from 'src/app/core/shared/stores/profile/profile.actions';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  profileState$: Observable<ProfileState>;
  user$: Observable<any>;
  dataStateEnum = DataStateEnum;

  constructor(
    private store: Store,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'MESSAGES.MENU.PROFILE' }, { label: 'MESSAGES.MENU.PROFILE', active: true }];
    
    this.profileState$ = this.store.select(selectProfileState);
    
    this.user$ = this.profileState$.pipe(
      map(state => {
        let userData = null;
        
        if (state?.user && state.user && Object.keys(state.user).length > 0) {
          userData = state.user;
        } else {
          const localUser = this.localStorageService.currentUserValue;
          if (localUser && Object.keys(localUser).length > 0) {
            userData = localUser;
            this.store.dispatch(setUserProfile({ user: localUser }));
          }
        }
        
        if (userData) {
          const normalized = this.normalizeUser(userData);
          return normalized;
        }
        
        return null;
      })
    );
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
      roles: user.roles,
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
}
