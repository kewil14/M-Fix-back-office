import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { UserTypeEnum } from 'src/app/core/config/list-roles';
import { selectUserState } from 'src/app/core/core.state';
import { UserResponseDto } from 'src/app/core/shared/dtos/user-response-dto.modal';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import { createWorkspaceWithAdminOk, erreursAuthentification } from 'src/app/core/shared/stores/authentification/authentification.actions';
import { deleteUser, erreurUsers, findAllUsers, loadUsers } from 'src/app/core/shared/stores/user/user.actions';
import { UserState } from 'src/app/core/shared/stores/user/user.state';
import { CreateWorkspaceAdminComponent } from '../create-workspace-admin/create-workspace-admin.component';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  userState$!: Observable<UserState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  // Filtres et pagination
  searchTerm: string = '';
  currentPage: number = 0;
  pageSize: number = 10;

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
    this.breadCrumbItems = [{ label: 'Admin' }, { label: 'Workspaces', active: true }];
    this.userState$ = this.storeService.select(selectUserState).pipe();
    this.actionWorkspaces();
    this.loadWorkspaces();
  }

  actionWorkspaces() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurUsers)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(createWorkspaceWithAdminOk)).subscribe(
        ({data}) => {
          this.messages$.next(
            {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'Workspace créé avec succès!', dismissible: false}
          );
          setTimeout(() => {
            this.loadWorkspaces();
          }, 1000);
        }
      ),
      this.actionService.pipe(ofType(loadUsers)).subscribe(() => {
        this.loadWorkspaces();
      })
    );
  }

  loadWorkspaces() {
    this.storeService.dispatch(findAllUsers({
      userType: UserTypeEnum.WORKSPACE_ADMIN,
      page: this.currentPage,
      size: this.pageSize,
      sort: 'creationDate,desc'
    }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadWorkspaces();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadWorkspaces();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadWorkspaces();
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
    this.modalRef = this.modalService.show(CreateWorkspaceAdminComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(user: UserResponseDto): void {
    // Rediriger vers la page de détail si nécessaire
  }

  onDelete(user: UserResponseDto): void {
    const initialState = {
      title: 'Supprimer le workspace',
      message: 'Êtes-vous sûr de vouloir supprimer ce workspace ?',
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
            this.loadWorkspaces();
          }, 1000);
        }
      });
    }
  }
}
