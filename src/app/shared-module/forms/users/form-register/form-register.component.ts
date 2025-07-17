import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { first, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

import { UntypedFormBuilder, UntypedFormGroup, } from '@angular/forms';


import { ActivatedRoute, Router } from '@angular/router';

import { UserProfileService } from 'src/app/core/services/user.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { UserRequestDto } from 'src/app/core/shared/dtos/user-request-dto.modal';
import { CountryEnum, UserTypeEnum } from 'src/app/core/config/list-roles';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { addUser, createUser, erreurUsers } from 'src/app/core/shared/stores/user/user.actions';

@Component({
  selector: 'app-form-register',
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.scss'],
})

export class FormRegisterComponent implements OnInit {

  signupForm: UntypedFormGroup;
  submitted = false;
  error = '';
  successmsg = false;

  subscriptions: Subscription[] = [];
  

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, 
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

    this.actionUser();
  }

  actionUser(){
    this.subscriptions.push(

      this.actionService.pipe(ofType(addUser)).subscribe((state) => {
        this.toastr.success('Compte cree avec success.', 'willo');

        setTimeout(() => {
          this.router.navigate(['/']);
        },4000);
        

      }),
      this.actionService.pipe(ofType(erreurUsers)).subscribe((state) => {
        this.toastr.error('Erreur.', 'willo');
        

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
        userPhoneNumber: this.signupForm.value.phone,

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
