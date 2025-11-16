import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { ActivatedRoute, Router } from '@angular/router';

import { APP_COLORS, APP_ENUMS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { connexion, connexionOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ListRoles } from 'src/app/core/config/list-roles';
import { APP_LINK } from 'src/app/core/config/app.url.config';
import { setState } from 'src/app/core/shared/stores/system-init/system-init.actions';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { selectauthentificationState } from 'src/app/core/core.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  error = '';
  returnUrl: string;
  fieldTextType: boolean = false;

  // Propriétés pour les images et styles
  servicesImage = '../../../../assets/images/bg-for white place.png';
  backgroundClass = 'bg-with-image';
  animationState = 'in';

  app_enum: typeof  APP_ENUMS = APP_ENUMS;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;


  subscriptions: Subscription[] = [];

  authentificationState$!: Observable<AuthentificationState>;


  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>
    ({type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false});


  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    private actionService: Actions,
    private storeService: Store,
  ) { }

  ngOnInit() {
    this.authentificationState$ = this.storeService.select(selectauthentificationState).pipe();


    this.initLoginForm();

    this.actionAuthentification();

    // reset login status
    // this.authenticationService.logout();
    // get return url from route parameters or default to '/'
    // tslint:disable-next-line: no-string-literal
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  initLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  // capture des differentes actions
  actionAuthentification(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreursAuthentification)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        )
      }),

      this.actionService.pipe(ofType(connexionOk)).subscribe(
        ({typeUser}) => {
          console.log('Connexion réussie, utilisateur:', typeUser);
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'connexion reussi' , dismissible: false}
          );

          // Récupération du rôle - accéder au premier rôle du tableau
          let role = typeUser?.roles?.[0]?.roleCode;
          console.log('Rôle détecté:', role);

          // Redirection immédiate ou avec un court délai pour afficher le message
          setTimeout(() => {
            if (role == ListRoles.ROL_USER) {
              console.log('Redirection vers page utilisateur');
              this.router.navigateByUrl(APP_LINK.LINK_DASHBOARD_USER || "/");
            }
            else if (role == ListRoles.ROL_ADMIN) {
              console.log('Redirection vers page admin');
              this.router.navigateByUrl(APP_LINK.LINK_DASHBOARD_ADMIN);
            }
            else {
              console.log('Rôle non reconnu:', role, 'Roles disponibles:', typeUser?.roles);
              // Redirection par défaut vers le dashboard admin si le rôle n'est pas reconnu
              this.router.navigateByUrl(APP_LINK.LINK_DASHBOARD_ADMIN);
            }
          }, 1000);
        }
      ),

      this.actionService.pipe(ofType(setState)).subscribe(
        ({res}) => {
          if(!res){
            setTimeout(() =>{},1000);
           this.router.navigateByUrl(APP_LINK.LINK_LISTE_AUTH_ADMIN);
          }
        }
      )
    )
  }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      console.log('Données envoyées:', this.loginForm.value); // Vérifie le format ici !
      this.storeService.dispatch(connexion({loginDto: this.loginForm.value}));

    }
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
    console.log("bien joué");
  }
}
