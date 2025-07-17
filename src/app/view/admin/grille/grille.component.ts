import { DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum, TypeGrilleEnum } from 'src/app/core/config/data.state.enum';
import { selectGrilleState } from 'src/app/core/core.state';
import { addGrilles, createGrilles, erreurGrilles } from 'src/app/core/shared/stores/grille/grille.actions';
import { GrilleState } from 'src/app/core/shared/stores/grille/grille.state';
import { NgbdCustomersSortableHeader } from 'src/app/pages/ecommerce/customers/customers-sortable.directive';
import { Customers } from 'src/app/pages/ecommerce/customers/customers.model';
import { CustomersService } from 'src/app/pages/ecommerce/customers/customers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grille',
  templateUrl: './grille.component.html',
  styleUrls: ['./grille.component.scss'],
  providers: [CustomersService, DecimalPipe]
})
export class GrilleComponent {

  modalRef?: BsModalRef;

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  formData: FormGroup;
  submitted = false;
  term: any;


  grilleState$: Observable<GrilleState>;

  // page
  currentpage: number;

  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  typeGrilleEnum: typeof TypeGrilleEnum = TypeGrilleEnum;
  
  subscriptions: Subscription[] = [];
  

  // Table data
  content?: any;
  customersData?: any;
  customersList!: Observable<Customers[]>;
  total: Observable<number>;
  @ViewChildren(NgbdCustomersSortableHeader) headers!: QueryList<NgbdCustomersSortableHeader>;

  isLoadingList: boolean = false;
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>
    ({type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false});
  


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

  ngOnInit() {
    // breadcrumb de visualisation de navigation sur la partie admin
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Customers', active: true }];
    this.isLoadingList = !this.isLoadingList;

    this.grilleState$ = this.storeService.select(selectGrilleState).pipe();

    this.initForm();

    this.currentpage = 1;

    /**
     * Fetches the data
     */
    this._fetchData();

    this.actionGrille();
  }

  actionGrille(): void {
      this.subscriptions.push(
        this.actionService.pipe(ofType(erreurGrilles)).subscribe(({messages}) => {
        // console.log(messages); 
          this.messages$.next({type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.SUCCESS, message: 'une erreur est survenue', dismissible: false});
        }), 

        this.actionService.pipe(ofType(addGrilles)).subscribe(({grille}) => {
          this.isLoadingList = !this.isLoadingList;
        }), 
  
      )
  }

  initForm(): void{
    this.formData = this.formBuilder.group({
      name: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      typeGrille: ['', [Validators.required, ]],
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
    const currentDate = new Date();
    if (this.formData.valid) {
      if (this.formData.get('ids')?.value) {
        this.customersData = this.customersData.map((data: { id: any; }) => data.id === this.formData.get('ids')?.value ? { ...data, ...this.formData.value } : data)
      }else{
      const username = this.formData.get('username').value;
      const email = this.formData.get('email').value;
      const phone = this.formData.get('phone').value;
      const address = this.formData.get('address').value;
      const balance = this.formData.get('balance').value;
      this.customersData.push({
        id: this.customersData.length + 1,
        username,
        email,
        phone,
        address,
        balance,
        rating: '4.3',
        date: currentDate + ':'
      })
      }
      this.modalService.hide()
    }
    this.submitted = true
  }

  saveGrille(){
    this.submitted = true;
    
    if(this.formData.invalid){
      return
    }

    let formValue = this.formData.value;
    
    let fomattedValue = {
      ...formValue,
      amount: parseFloat(Number(formValue.amount).toFixed(1)),
    };

    console.log(fomattedValue);

    // dispacher l'action de create de grille tarifaire
    this.storeService.dispatch(createGrilles({grilles: fomattedValue}))
  }

  // Delete Data
  delete(id:any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Etes vous sur de vouloir le supprimer?',
        text: 'You won\'t be able to delete this!',
        icon: 'warning',
        confirmButtonText: 'Oui, le supprimer!',
        cancelButtonText: 'Non, annuler!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          swalWithBootstrapButtons.fire(
            'Supprime!',
            'cet element de grille a ete supprime.',
            'success'
          );
          document.getElementById('c_'+ id)?.remove();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Annuler',
            'cet element n\'a pas ete supprime :)',
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

}
