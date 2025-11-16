import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum, OperationEnum } from 'src/app/core/config/data.state.enum';
import { selectRoleState } from 'src/app/core/core.state';
import { AutorisationResponseDto } from 'src/app/core/shared/dtos/autorisation-response-dto';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { erreurRoles, setRoleItem, findAllRoleItem } from 'src/app/core/shared/stores/role/role.actions';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';

@Component({
  selector: 'app-autorisation',
  templateUrl: './autorisation.component.html',
  styleUrls: ['./autorisation.component.scss']
})
export class AutorisationComponent implements OnInit, OnDestroy {

  dtOptions:any;
  breadCrumbItems!: Array<{}>;
  roleState$!: Observable<RoleState>;
  roles: AutorisationResponseDto[] = [];
  authority$: BehaviorSubject<{authority: AutorisationResponseDto, operation: string}> = new BehaviorSubject<{authority: AutorisationResponseDto, operation: string}>({authority: {}, operation: OperationEnum.CREATE});
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;

  isEdit: boolean = false;
  isShow:  boolean = false;
  //message de valid et d'erreur
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>
    ({type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false});

  // Filtres et pagination
  searchTerm: string = '';
  filteredPermissions: AutorisationResponseDto[] = [];
  allPermissions: AutorisationResponseDto[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;


  constructor(
    private storeService: Store,
    private localStorageService: LocalStorageService,
    private actionService: Actions,
    private translateService: TranslateService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getTitlePath();
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    this.dtOptions = this.localStorageService.dbOptions();
    // Charger les autorisations au démarrage
    this.storeService.dispatch(findAllRoleItem());
    this.actionAuthority();
    this.subscribeToPermissions();
  }

  subscribeToPermissions(): void {
    this.subscriptions.push(
      this.roleState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.ruleItems) {
          this.allPermissions = state.ruleItems;
          this.applyFilters();
        }
      })
    );
  }

  applyFilters(): void {
    let filtered = [...this.allPermissions];
    
    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(perm => 
        (perm.authorisationName || '').toLowerCase().includes(term) ||
        (perm.authorisationKey || '').toLowerCase().includes(term) ||
        (perm.authorisationGroup?.groupName || '').toLowerCase().includes(term) ||
        (perm.authorisationDescription || '').toLowerCase().includes(term)
      );
    }
    
    this.filteredPermissions = filtered;
    this.totalPages = Math.ceil(this.filteredPermissions.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  get paginatedPermissions(): AutorisationResponseDto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPermissions.slice(start, end);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

 
  
  actionAuthority(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(setRoleItem)).subscribe(() => {
        this.authority$.next({authority: {}, operation: OperationEnum.CREATE});
        this.loading$.next(false);
        this.isEdit = false;
        this.isShow = true;
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: 'modification effectuee' , dismissible: false}
        );
        // this.loadAuthorities();
      }),
      this.actionService.pipe(ofType(erreurRoles)).subscribe(({messages}) => {
        // console.log(messages);
        this.loading$.next(false);
        this.isShow = true;
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages![0] , dismissible: false}
        )
      }),

    )
  }


  getTitlePath(): void {
    this.breadCrumbItems = [
      { label: this.translateService.instant('ADMIN.SIDER.AUTHORIZATION.LIST.FUNCTION') },
      { label: this.translateService.instant('ADMIN.SIDER.AUTHORIZATION.LIST.FUNCTION'), active: true }
      // { label: 'Authorizations' },
      // { label: 'Authorities', active: true }
    ];
  }

  
  seeAuthority(autority: AutorisationResponseDto): void {
    // Rediriger vers la page de détail
    if (autority.authorisationKey) {
      this.router.navigate(['/admin/autorisation/permission/detail', autority.authorisationKey]);
    }
  }

  close(): void {
    this.isEdit = !this.isEdit
  }

  cancelEdit($event: boolean): void {
    this.authority$.next({authority: {}, operation: OperationEnum.CREATE});
    this.loading$.next(false);
    this.isEdit = false;
  }


}


