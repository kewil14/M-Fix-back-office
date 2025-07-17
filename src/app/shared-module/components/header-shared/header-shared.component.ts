import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { APP_ENUMS } from 'src/app/core/config/app.enums.config';
import { ListRoles } from 'src/app/core/config/list-roles';
import { selectProfileState } from 'src/app/core/core.state';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { setUserProfile } from 'src/app/core/shared/stores/profile/profile.actions';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';

@Component({
  selector: 'willo-header-shared',
  templateUrl: './header-shared.component.html',
  styleUrls: ['./header-shared.component.scss']
})
export class HeaderSharedComponent implements OnInit {
  app_enum: typeof  APP_ENUMS = APP_ENUMS;
  year: number = new Date().getFullYear();
  currentSection = 'home';
  listRoles: typeof ListRoles = ListRoles;

  profileState$: Observable<ProfileState>;
  

  constructor(
    private localStorageService: LocalStorageService,
    private router: Router,
    private storeService: Store,
    
  ) { }

  ngOnInit() {
    // je recupere le profile state
    this.profileState$ = this.storeService.select(selectProfileState).pipe();
  }


  toggleMenu() {
    document.getElementById('topnav-menu-content').classList.toggle('show');
  }

  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
      navbar.classList.add('nav-sticky');
    } else {
      navbar.classList.remove('nav-sticky');
    }
  }

  logout() {
    this.localStorageService.logout();
    
    // je vide le profile du store
    this.storeService.dispatch(setUserProfile({user: null}));
    // je redirige vers la page de login
    this.router.navigate(['/auth']);
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

}
