import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAdminState } from 'src/app/core/core.state';
import { AdminListRequestDto } from 'src/app/core/shared/dtos/admin-list-request-dto';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { createAdminOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import {
  findAllAdmins,
  deleteAdmin,
  reactivateAdmin,
  erreurAdmins,
  addAdmin,
  loadAdmins
} from 'src/app/core/shared/stores/admin/admin.actions';
import { AdminState } from 'src/app/core/shared/stores/admin/admin.state';
import { CreateAdminComponent } from '../create-admin/create-admin.component';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  adminState$!: Observable<AdminState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  // Filtres et pagination
  searchTerm: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';

  constructor(
    private modalService: BsModalService,
    private storeService: Store,
    private actionService: Actions,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Administrateurs', active: true }];
    this.adminState$ = this.storeService.select(selectAdminState).pipe();
    this.actionAdmins();
    this.loadAdmins();
  }

  actionAdmins() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurAdmins)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addAdmin)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Administrateur créé avec succès!', dismissible: false}
        );
        setTimeout(() => {
          this.loadAdmins();
        }, 1000);
      }),
      this.actionService.pipe(ofType(createAdminOk)).subscribe(
        ({user}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Administrateur créé avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.loadAdmins();
          }, 1000);
        }
      ),
      this.actionService.pipe(ofType(loadAdmins)).subscribe(() => {
        // Les administrateurs sont chargés
      })
    );
  }

  loadAdmins() {
    const filters: AdminListRequestDto = {
      search: this.searchTerm || undefined,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllAdmins({ filters }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadAdmins();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadAdmins();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadAdmins();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadAdmins();
  }

  getPageNumbers(state: AdminState): number[] {
    if (!state || state.totalPages === 0) return [];
    const pages: number[] = [];
    const maxPages = Math.min(5, state.totalPages);
    let startPage = Math.max(0, state.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(state.totalPages - 1, startPage + maxPages - 1);
    
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
    this.modalRef = this.modalService.show(CreateAdminComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(admin: EmployeeResponseDto): void {
    // Rediriger vers la page de détail
    if (admin.id) {
      this.router.navigate(['/admin/admins/detail', admin.id]);
    }
  }

  onEdit(admin: EmployeeResponseDto): void {
    // Rediriger vers la page d'édition
    if (admin.id) {
      this.router.navigate(['/admin/admins/edit', admin.id]);
    }
  }

  onDelete(admin: EmployeeResponseDto): void {
    const initialState = {
      title: 'Désactiver l\'administrateur',
      message: 'Êtes-vous sûr de vouloir désactiver cet administrateur ?',
      itemName: `${admin.firstName} ${admin.lastName}`,
      confirmBtnText: 'Désactiver',
      cancelBtnText: 'Annuler'
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.storeService.dispatch(deleteAdmin({ adminId: admin.id }));
          setTimeout(() => {
            this.loadAdmins();
          }, 1000);
        }
      });
    }
  }

  onReactivate(admin: EmployeeResponseDto): void {
    this.storeService.dispatch(reactivateAdmin({ adminId: admin.id }));
    setTimeout(() => {
      this.loadAdmins();
    }, 1000);
  }
}
