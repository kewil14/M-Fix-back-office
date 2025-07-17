import { DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, catchError, Observable, of, Subject, Subscription, takeUntil } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { UserTypeEnum } from 'src/app/core/config/list-roles';
import { selectUserState } from 'src/app/core/core.state';
import { UserRequestDto } from 'src/app/core/shared/dtos/user-request-dto.modal';
import { addUser, createUser, deleteUser, erreurUsers } from 'src/app/core/shared/stores/user/user.actions';
import { UserState } from 'src/app/core/shared/stores/user/user.state';
import { NgbdCustomersSortableHeader } from 'src/app/pages/ecommerce/customers/customers-sortable.directive';
import { Customers } from 'src/app/pages/ecommerce/customers/customers.model';
import { CustomersService } from 'src/app/pages/ecommerce/customers/customers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  providers: [CustomersService, DecimalPipe]
})
export class CustomersComponent {

  modalRef?: BsModalRef;

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  formData: FormGroup;
  submitted = false;
  term: any;

  customerState$!: Observable<UserState>;

  // page
  currentpage: number;

  // enum de l'etat de notre state
  dataStateEnum: typeof DataStateEnum = DataStateEnum;

  subscriptions: Subscription[] = [];


  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>
      ({type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false});

  private destroy$ = new Subject<void>();
  

  // Table data
  content?: any;
  customersData?: any;
  customersList!: Observable<Customers[]>;
  total: Observable<number>;
  @ViewChildren(NgbdCustomersSortableHeader) headers!: QueryList<NgbdCustomersSortableHeader>;

  constructor(
    private modalService: BsModalService, 
    private formBuilder: FormBuilder, 
    public service: CustomersService,
    private storeService: Store,
    private actionService: Actions,
  ) {
    this.customersList = service.customers$;
    this.total = service.total$;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Customers', active: true }];


    this.customerState$ = this.storeService.select(selectUserState).pipe();

    this.initFormUser();
    

    this.currentpage = 1;

    /**
     * Fetches the data
     */
    this._fetchData();

    // actionOfUserState
    this.actionCustomer();
  }


  // capture des differentes actions
  actionCustomer(): void {
      this.subscriptions.push(
        this.actionService.pipe(ofType(erreurUsers)).subscribe(({messages}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
          )
        }),
  
        this.actionService.pipe(ofType(addUser)).subscribe(
          ({user}) => {
            this.messages$.next(
              {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'utilisateur ajoute avec success' , dismissible: false}
            );
              setTimeout(() =>{
                this.modalService.hide();
                this.formData.reset();
                this.submitted = false;
              }, 1000);
          }
        ),
      )
    }

  initFormUser(): void{
    this.formData = this.formBuilder.group({
      userFirstName: ['', [Validators.required]],
      userLastName: ['', [Validators.required]],
      userEmail: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      country: ['', [Validators.required]],
      userPhoneNumber: ['', [Validators.required]],
      image: ['https://drive.google.com/file/d/1XpSMDrTskgpVwkPK5bZuiiFH9kuZ4AFA/view?usp=drive_link', ]
    });
  }

  /**
   * Customers data fetches
   */
  private _fetchData() {
    // this.customersData = customersData;
    this.customersList.subscribe(x => {
      this.content = this.customersData;
      this.customersData =  Object.assign([], x);
    });
  }
  get form() {
    return this.formData.controls;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content);
  }

  saveCustomer() {
    // const currentDate = new Date();
    // if (this.formData.valid) {
    //   if (this.formData.get('ids')?.value) {
    //     this.customersData = this.customersData.map((data: { id: any; }) => data.id === this.formData.get('ids')?.value ? { ...data, ...this.formData.value } : data)
    //   }else{
    //   const username = this.formData.get('username').value;
    //   const email = this.formData.get('email').value;
    //   const phone = this.formData.get('phone').value;
    //   const address = this.formData.get('address').value;
    //   const balance = this.formData.get('balance').value;
    //   this.customersData.push({
    //     id: this.customersData.length + 1,
    //     username,
    //     email,
    //     phone,
    //     address,
    //     balance,
    //     rating: '4.3',
    //     date: currentDate + ':'
    //   })
    //   }
    //   this.modalService.hide()
    // }
    // this.submitted = true

    this.submitted = true;

    if(this.formData.invalid){
      return
    }

    let cudtomrtDto: UserRequestDto = {
      userFirstName: this.formData.get('userFirstName')?.value,
      userLastName: this.formData.get('userLastName')?.value,
      userEmail: this.formData.get('userEmail')?.value,
      country: this.formData.get('country')?.value,
      userPhoneNumber: this.formData.get('userPhoneNumber')?.value,
      userPassword: "123@",
      image: this.formData.get('image')?.value,
      userType: UserTypeEnum.CUSTOMER ,
    };

    this.storeService.dispatch(createUser({user: cudtomrtDto}));
  }

  // Delete Data
  // delete(id:any) {
  //   const swalWithBootstrapButtons = Swal.mixin({
  //     customClass: {
  //       confirmButton: 'btn btn-success',
  //       cancelButton: 'btn btn-danger ms-2'
  //     },
  //     buttonsStyling: false
  //   });

  //   swalWithBootstrapButtons
  //     .fire({
  //       title: 'Are you sure?',
  //       text: 'You won\'t be able to revert this!',
  //       icon: 'warning',
  //       confirmButtonText: 'Yes, delete it!',
  //       cancelButtonText: 'No, cancel!',
  //       showCancelButton: true
  //     })
  //     .then(result => {
  //       if (result.value) {
  //         swalWithBootstrapButtons.fire(
  //           'Deleted!',
  //           'Your file has been deleted.',
  //           'success'
  //         );
  //         document.getElementById('c_'+ id)?.remove();
  //       } else if (
  //         /* Read more about handling dismissals below */
  //         result.dismiss === Swal.DismissReason.cancel
  //       ) {
  //         swalWithBootstrapButtons.fire(
  //           'Cancelled',
  //           'Your imaginary file is safe :)',
  //           'error'
  //         );
  //       }
  //     });
  // }

  delete(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });
  
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          // Dispatch l'action pour supprimer l'élément
          // this.storeService.dispatch(deleteUser(id))
          //   .pipe(
          //     // Utilisez takeUntil pour éviter les fuites de mémoire
          //     takeUntil(this.destroy$),
          //     // Gérez les cas de succès et d'erreur
          //     catchError(error => {
          //       swalWithBootstrapButtons.fire(
          //         'Error!',
          //         'Failed to delete the item. Please try again.',
          //         'error'
          //       );
          //       return of(null);
          //     })
          //   )
          //   .subscribe(response => {
          //     if (response) {
          //       swalWithBootstrapButtons.fire(
          //         'Deleted!',
          //         'Your item has been deleted.',
          //         'success'
          //       );
          //       // La suppression du DOM peut être gérée par le reducer

          //       // Mais vous pouvez aussi le faire ici si nécessaire
          //       document.getElementById('c_' + id)?.remove();
          //     }
          //   });


          this.storeService.dispatch(deleteUser({userCode: id}));
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your item is safe :)',
            'error'
          );
        }
      });
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
   editDataGet(id: any, content:any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Customer';
    var updateBtn = document.getElementById('btn-save-event') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";
    var listData = this.customersData.filter((data: { id: any; }) => data.id === id);
    this.formData.controls['username'].setValue(listData[0].username);
    this.formData.controls['email'].setValue(listData[0].email);
    this.formData.controls['phone'].setValue(listData[0].phone);
    this.formData.controls['address'].setValue(listData[0].address);
    this.formData.controls['balance'].setValue(listData[0].balance);
    this.formData.controls['ids'].setValue(listData[0].id);
  }


  cancelForm(){
    this.submitted = false;
    this.formData.reset();
  }

}
