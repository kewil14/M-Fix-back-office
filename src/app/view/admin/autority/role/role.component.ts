import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectRoleState } from 'src/app/core/core.state';
import { GroupItemsFinDto } from 'src/app/core/shared/dtos/group-items-fin-dto.modal';
import { RoleResponseDto } from 'src/app/core/shared/dtos/role-response-dto';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { RoleService } from 'src/app/core/shared/services/role.service';
import { deleteRole, erreurRoles, findAvailableRoles } from 'src/app/core/shared/stores/role/role.actions';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy{
  
  roleState$!: Observable<RoleState>;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  dbOptions: any = {};
  breadCrumbItems!: Array<{}>;
  isEdit: boolean = false;
  // roles: Role[]=[];
  availableGroupAuthorities$!: Observable<Array<GroupItemsFinDto>>;
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>
  ({type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false});

  // Filtres et pagination
  searchTerm: string = '';
  filteredRoles: RoleResponseDto[] = [];
  allRoles: RoleResponseDto[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  modalRef?: BsModalRef;

  constructor(
    private localStorageService: LocalStorageService,
    private storeService: Store,
    private router: Router,
    private actionService: Actions,
    private roleService: RoleService,
    private modalService: BsModalService
    ){}
    ngOnDestroy(): void {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
    
  

  ngOnInit(): void {
    this.getTitlePattern();
    this.dbOptions = this.localStorageService.dbOptions();
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    // Charger les rôles disponibles au démarrage (nouveau endpoint)
    this.storeService.dispatch(findAvailableRoles({}));
    this.actionRole();
    this.subscribeToRoles();
  }

  subscribeToRoles(): void {
    this.subscriptions.push(
      this.roleState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.rules) {
          this.allRoles = state.rules;
          this.applyFilters();
        }
      })
    );
  }

  applyFilters(): void {
    let filtered = [...this.allRoles];
    
    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(role => 
        (role.name || role.roleName || '').toLowerCase().includes(term) ||
        (role.code || role.roleCode || '').toLowerCase().includes(term) ||
        (role.description || role.roleDescription || '').toLowerCase().includes(term)
      );
    }
    
    this.filteredRoles = filtered;
    this.totalPages = Math.ceil(this.filteredRoles.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  get paginatedRoles(): RoleResponseDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredRoles.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get Math() {
    return Math;
  }
  

  actionRole(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurRoles)).subscribe(({messages}) => {
        // console.log(messages);
        this.messages$.next({type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.SUCCESS, message: 'une erreur est survenue', dismissible: false});
      }),


    )
  }

  // loadRoles(): void {
  //   this.roles = [];
    
  //   setTimeout(() => {
    //     this.storeService.select(selectRoleState).pipe(map(({items}) => items)).subscribe((items) => {
  //       this.roles = items;
  //     });
  //   }, 2000);
  // }

  
  getTitlePattern(): void {
    this.breadCrumbItems = [
      { label: 'Authorizations' },
      { label: 'roles', active: true }
    ];
  }

  onDelete(role: RoleResponseDto): void {
    const initialState = {
      title: 'Supprimer le rôle',
      message: 'Êtes-vous sûr de vouloir supprimer ce rôle ?',
      itemName: role.name || role.roleName || 'ce rôle',
      confirmBtnText: 'Supprimer',
      cancelBtnText: 'Annuler'
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.storeService.dispatch(deleteRole({role}));
        }
      });
    }
  }

  onAddRole(){
    this.router.navigateByUrl('/admin/autorisation/role/create/0');
  }


  onSee(role: RoleResponseDto): void {
    // Rediriger vers la page de détail
    const roleId = role.id || role.roleCode || role.code;
    this.router.navigate(['/admin/autorisation/role/detail', roleId]);
  }
}
