import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectRoleState } from 'src/app/core/core.state';
import { GroupItemsFinDto } from 'src/app/core/shared/dtos/group-items-fin-dto.modal';
import { RoleResponseDto } from 'src/app/core/shared/dtos/role-response-dto';
import { RoleService } from 'src/app/core/shared/services/role.service';
import { findAvailableRoles } from 'src/app/core/shared/stores/role/role.actions';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss']
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  roleState$!: Observable<RoleState>;
  role: RoleResponseDto | null = null;
  roleId: string | null = null;
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  availableGroupAuthorities$!: Observable<Array<GroupItemsFinDto>>;
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Authorizations' },
      { label: 'Rôles', routerLink: '/admin/autorisation/role' },
      { label: 'Détail', active: true }
    ];
    
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    this.route.paramMap.subscribe(params => {
      this.roleId = params.get('id');
      if (this.roleId) {
        this.loadRole();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadRole(): void {
    this.subscriptions.push(
      this.roleState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.rules) {
          this.role = state.rules.find(r => 
            (r.id === this.roleId) || 
            (r.roleCode === this.roleId) || 
            (r.code === this.roleId)
          ) || null;
          
          if (this.role) {
            this.loadPermissions();
          }
        }
      })
    );
    
    // S'assurer que les rôles sont chargés
    this.storeService.dispatch(findAvailableRoles({}));
  }

  loadPermissions(): void {
    if (!this.role) return;
    
    const permissions = this.role.permissions || this.role.authorisations || [];
    if (this.role.permissions && this.role.permissions.length > 0) {
      const authorisations = this.role.permissions.map((perm: any) => ({
        authorisationName: perm.name,
        authorisationGroup: { groupName: perm.resource || perm.scope || 'default' }
      }));
      this.availableGroupAuthorities$ = this.roleService.getListFin(authorisations);
    } else {
      this.availableGroupAuthorities$ = this.roleService.getListFin(this.role.authorisations || []);
    }
  }

  onEdit(): void {
    if (this.roleId) {
      this.router.navigate(['/admin/autorisation/role/create', this.roleId]);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/autorisation/role']);
  }

  getTotalPermissions(groups: GroupItemsFinDto[] | null): number {
    if (!groups) return 0;
    return groups.reduce((acc, g) => acc + (g.items?.length || 0), 0);
  }
}

