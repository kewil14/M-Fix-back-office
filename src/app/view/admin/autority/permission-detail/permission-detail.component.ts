import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectRoleState } from 'src/app/core/core.state';
import { AutorisationResponseDto } from 'src/app/core/shared/dtos/autorisation-response-dto';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';

@Component({
  selector: 'app-permission-detail',
  templateUrl: './permission-detail.component.html',
  styleUrls: ['./permission-detail.component.scss']
})
export class PermissionDetailComponent implements OnInit, OnDestroy {
  roleState$!: Observable<RoleState>;
  permission: AutorisationResponseDto | null = null;
  permissionId: string | null = null;
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Authorizations' },
      { label: 'Permissions', routerLink: '/admin/autorisation' },
      { label: 'Détail', active: true }
    ];
    
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    this.route.paramMap.subscribe(params => {
      this.permissionId = params.get('id');
      if (this.permissionId) {
        this.loadPermission();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadPermission(): void {
    this.subscriptions.push(
      this.roleState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.ruleItems) {
          this.permission = state.ruleItems.find(p => 
            p.authorisationKey === this.permissionId
          ) || null;
        }
      })
    );
  }

  onBack(): void {
    this.router.navigate(['/admin/autorisation']);
  }
}

