import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { ActivatedRoute, Router } from '@angular/router';

import { APP_COLORS, APP_ENUMS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { connexion, connexionOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { BehaviorSubject, first, Observable, Subscription } from 'rxjs';
import { CountryEnum, ListRoles, UserTypeEnum } from 'src/app/core/config/list-roles';
import { APP_LINK } from 'src/app/core/config/app.url.config';
import { setState } from 'src/app/core/shared/stores/system-init/system-init.actions';
import { AuthentificationState } from 'src/app/core/shared/stores/authentification/authentification.state';
import { selectauthentificationState } from 'src/app/core/core.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { environment } from 'src/environments/environment';
import { UserProfileService } from 'src/app/core/services/user.service';
import { UserRequestDto } from 'src/app/core/shared/dtos/user-request-dto.modal';
import { addUser, createUser, erreurUsers } from 'src/app/core/shared/stores/user/user.actions';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

/**
 * Login component
 */
export class RegisterComponent implements OnInit {

  signupForm: UntypedFormGroup;
  submitted = false;
  error = '';
  successmsg = false;

  subscriptions: Subscription[] = [];


  // Propriétés pour les images et styles
  servicesImage = '../../../../assets/images/bg-for white place.png';
  backgroundClass = 'bg-with-image';
  animationState = 'in';

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private authenticationService: AuthenticationService,
    private userService: UserProfileService,
    private storeService: Store,
    private actionService: Actions,
    private toastr:ToastrService,
    
  ) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // this.actionUser();
  }

  actionUser(){
        this.subscriptions.push(
  
          this.actionService.pipe(ofType(addUser)).subscribe((state) => {
            this.toastr.success('Inscription reussie.', 'willo');

            this.router.navigate(['/']);
            
  
          }),
          this.actionService.pipe(ofType(erreurUsers)).subscribe((state) => {
  
  
          }),


            
      )
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    } else {

      // definir ici l'objet user
      let user: UserRequestDto = {
      userFirstName: this.signupForm.value.username,
      // userLastName: ,
      userEmail: this.signupForm.value.email,
      userType: UserTypeEnum.CUSTOMER,
      userPhoneNumber: this.signupForm.value.username,
      country: CountryEnum.FRANCE,
      userPassword: "customer@12",
      image: "",
    }

    // dispatch d action de create du user
    this.storeService.dispatch(createUser({user: user}));

          
      // if (environment.defaultauth === 'firebase') {
      //   this.authenticationService.register(this.f.email.value, this.f.password.value).then((res: any) => {
      //     this.successmsg = true;
      //     if (this.successmsg) {
      //       this.router.navigate(['/dashboard']);
      //     }
      //   })
      //     .catch(error => {
      //       this.error = error ? error : '';
      //     });
      // } else {
      //   this.userService.register(this.signupForm.value)
      //     .pipe(first())
      //     .subscribe(
      //       data => {
      //         this.successmsg = true;
      //         if (this.successmsg) {
      //           this.router.navigate(['/account/login']);
      //         }
      //       },
      //       error => {
      //         this.error = error ? error : '';
      //       });
      // }
    }
  }
}
