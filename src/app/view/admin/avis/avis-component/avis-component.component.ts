import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { map, Observable, Subscription } from 'rxjs';
import { AvisStateEnum, DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAvisState } from 'src/app/core/core.state';
import { AvisRequestDto } from 'src/app/core/shared/dtos/avis-request-dto.modal';
import { Avis } from 'src/app/core/shared/models/avis.modal';
import { setAvis, updateStatusAvis } from 'src/app/core/shared/stores/avis/avis.actions';
import { AvisState } from 'src/app/core/shared/stores/avis/avis.state';
import { NgbdCustomersSortableHeader } from 'src/app/pages/ecommerce/customers/customers-sortable.directive';
import { Customers } from 'src/app/pages/ecommerce/customers/customers.model';
import { CustomersService } from 'src/app/pages/ecommerce/customers/customers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-avis-component',
  templateUrl: './avis-component.component.html',
  styleUrls: ['./avis-component.component.css']
})
export class AvisComponentComponent {

  selectedAvisState: AvisStateEnum | null = null;
  currentAvis: Avis;

  modalRef?: BsModalRef;

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  term: any;
  
  // enum de l'etat de notre state
  dataStateEnum: typeof DataStateEnum = DataStateEnum;

  // enum des avus
  avisStateEnum: typeof AvisStateEnum = AvisStateEnum;

  // page
  currentpage: number;

  // j'affecte cela a une variable observable de mon store
  avisState$: Observable<AvisState>;

  subscriptions: Subscription[] = [];

  isSubmitted: boolean = false


  // Table data
  content?: any;
  customersData?: any;
  customersList!: Observable<Customers[]>;
  total: Observable<number>;
  @ViewChildren(NgbdCustomersSortableHeader) headers!: QueryList<NgbdCustomersSortableHeader>;

  constructor(
    private modalService: BsModalService, 
    public service: CustomersService,
    private storeService: Store,
    private actionService: Actions,
  ) {
    this.customersList = service.customers$;
    this.total = service.total$;


  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Customers', active: true }];

    this.avisState$ = this.storeService.select(selectAvisState).pipe();

    

    this.currentpage = 1;

    /**
     * Fetches the data
     */
    this._fetchData();

    this.actionAvis();
  }


  actionAvis(){
    this.subscriptions.push(
      this.actionService.pipe(ofType(setAvis)).subscribe((state) => {
        // mettre le boolean du loadind du bouton a false
        this.isSubmitted = false;
        
        // fermer le modal
        this.modalService.hide();

      })
        
  )
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
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
          document.getElementById('c_'+ id)?.remove();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
      });
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
   onAvisModal(avis: any, content:any) {
    // this.submitted = false;
    this.currentAvis = avis;
    this.selectedAvisState = null;
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
    // var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    // modelTitle.innerHTML = 'Edit Customer';
    // var updateBtn = document.getElementById('btn-save-event') as HTMLAreaElement;
    // updateBtn.innerHTML = "Update";
    // var listData = this.customersData.filter((data: { id: any; }) => data.id === id);
    // this.formData.controls['username'].setValue(listData[0].username);
    // this.formData.controls['email'].setValue(listData[0].email);
    // this.formData.controls['phone'].setValue(listData[0].phone);
    // this.formData.controls['address'].setValue(listData[0].address);
    // this.formData.controls['balance'].setValue(listData[0].balance);
    // this.formData.controls['ids'].setValue(listData[0].id);
  }


  updateAvisState(): void{
    let avis: AvisRequestDto ={
      idAvis: this.currentAvis.id,
      note: this.currentAvis.note,
      userId: this.currentAvis.user.userCode,
      state: this.currentAvis.state,
      description: this.currentAvis.description,
      isValidated: this.currentAvis.isValidated,
    }
    if(!selectAvisState || !this.currentAvis){
      return;
    }

    this.isSubmitted = true;

    this.storeService.dispatch(updateStatusAvis({avis: avis, status: true ? this.selectedAvisState == AvisStateEnum.APPROUVE : false}));
  }

}
