import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { UserTypeEnum } from 'src/app/core/config/list-roles';
import { selectUserState } from 'src/app/core/core.state';
import { UserResponseDto } from 'src/app/core/shared/dtos/user-response-dto.modal';
import { UserRequestDto } from 'src/app/core/shared/dtos/user-request-dto.modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { addUser, createUser, deleteUser, erreurUsers, findAllUsers, loadUsers, updateUser } from 'src/app/core/shared/stores/user/user.actions';
import { UserState } from 'src/app/core/shared/stores/user/user.state';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  userState$!: Observable<UserState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  // Form
  formData!: FormGroup;
  submitted = false;
  isEditMode = false;
  editingUser: UserResponseDto | null = null;

  // Filtres et pagination
  searchTerm: string = '';
  currentPage: number = 0;
  pageSize: number = 10;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private storeService: Store,
    private actionService: Actions,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Clients', active: true }];
    this.userState$ = this.storeService.select(selectUserState).pipe();
    this.initForm();
    this.actionUser();
    this.loadUsers();
  }

  initForm(): void {
    this.formData = this.formBuilder.group({
      userFirstName: ['', [Validators.required]],
      userLastName: ['', [Validators.required]],
      userEmail: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]],
      country: ['', [Validators.required]],
      userPhoneNumber: ['', [Validators.required]],
      image: ['']
    });
  }

  get form() {
    return this.formData.controls;
  }

  actionUser() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurUsers)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addUser)).subscribe(
        ({user}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Utilisateur ajouté avec succès', dismissible: false}
          );
          setTimeout(() => {
            this.closeModal();
            this.loadUsers();
          }, 1000);
        }
      ),
      this.actionService.pipe(ofType(loadUsers)).subscribe(() => {
        this.loadUsers();
      })
    );
  }

  loadUsers() {
    this.storeService.dispatch(findAllUsers({
      userType: UserTypeEnum.CUSTOMER,
      page: this.currentPage,
      size: this.pageSize,
      sort: 'creationDate,desc'
    }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadUsers();
  }

  getPageNumbers(state: UserState): number[] {
    if (!state || !state.users) return [];
    const totalPages = Math.ceil(state.users.length / this.pageSize);
    if (totalPages === 0) return [];
    const pages: number[] = [];
    const maxPages = Math.min(5, totalPages);
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get Math() {
    return Math;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingUser = null;
    this.formData.reset();
    this.submitted = false;
    this.modalRef = this.modalService.show('userModal', { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onEdit(user: UserResponseDto): void {
    this.isEditMode = true;
    this.editingUser = user;
    this.formData.patchValue({
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      userEmail: user.userEmail,
      country: user.userPhoneNumber?.split(' ')[0] || '',
      userPhoneNumber: user.userPhoneNumber,
      image: user.image
    });
    this.submitted = false;
    this.modalRef = this.modalService.show('userModal', { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(user: UserResponseDto): void {
    // Rediriger vers la page de détail si nécessaire
    // this.router.navigate(['/admin/users/detail', user.userCode]);
  }

  onDelete(user: UserResponseDto): void {
    const initialState = {
      title: 'Supprimer l\'utilisateur',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      itemName: `${user.userFirstName} ${user.userLastName}`,
      confirmBtnText: 'Supprimer',
      cancelBtnText: 'Annuler'
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed && user.userCode) {
          this.storeService.dispatch(deleteUser({userCode: user.userCode}));
          setTimeout(() => {
            this.loadUsers();
          }, 1000);
        }
      });
    }
  }

  saveUser() {
    this.submitted = true;
    if (this.formData.invalid) {
      return;
    }

    if (this.isEditMode && this.editingUser) {
      // Update user
      const userDto: UserRequestDto = {
        userCode: this.editingUser.userCode,
        userFirstName: this.formData.get('userFirstName')?.value,
        userLastName: this.formData.get('userLastName')?.value,
        userEmail: this.formData.get('userEmail')?.value,
        country: this.formData.get('country')?.value,
        userPhoneNumber: this.formData.get('userPhoneNumber')?.value,
        image: this.formData.get('image')?.value || '',
        userType: UserTypeEnum.CUSTOMER,
      };
      this.storeService.dispatch(updateUser({user: userDto}));
    } else {
      // Create user
      const userDto: UserRequestDto = {
        userFirstName: this.formData.get('userFirstName')?.value,
        userLastName: this.formData.get('userLastName')?.value,
        userEmail: this.formData.get('userEmail')?.value,
        country: this.formData.get('country')?.value,
        userPhoneNumber: this.formData.get('userPhoneNumber')?.value,
        userPassword: "123@",
        image: this.formData.get('image')?.value || '',
        userType: UserTypeEnum.CUSTOMER,
      };
      this.storeService.dispatch(createUser({user: userDto}));
    }
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.formData.reset();
    this.submitted = false;
    this.isEditMode = false;
    this.editingUser = null;
  }

  cancelForm() {
    this.closeModal();
  }
}
