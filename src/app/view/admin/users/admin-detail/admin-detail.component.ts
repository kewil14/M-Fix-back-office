import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectAdminState } from 'src/app/core/core.state';
import { EmployeeResponseDto } from 'src/app/core/shared/dtos/employee-response-dto';
import { findAdminById } from 'src/app/core/shared/stores/admin/admin.actions';
import { AdminState } from 'src/app/core/shared/stores/admin/admin.state';

@Component({
  selector: 'app-admin-detail',
  templateUrl: './admin-detail.component.html',
  styleUrls: ['./admin-detail.component.scss']
})
export class AdminDetailComponent implements OnInit, OnDestroy {
  adminState$!: Observable<AdminState>;
  admin: EmployeeResponseDto | null = null;
  adminId: string | null = null;
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
      { label: 'Admin' },
      { label: 'Administrateurs', routerLink: '/admin/admins' },
      { label: 'Détail', active: true }
    ];
    
    this.adminState$ = this.storeService.select(selectAdminState).pipe();
    
    // S'abonner aux changements d'état pour mettre à jour l'admin
    this.subscriptions.push(
      this.adminState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.admin) {
          // Vérifier que l'admin correspond à l'ID dans l'URL
          if (!this.adminId || state.admin.id === this.adminId) {
            this.admin = state.admin;
          }
        }
      })
    );
    
    this.route.paramMap.subscribe(params => {
      this.adminId = params.get('id');
      if (this.adminId) {
        this.loadAdmin();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAdmin(): void {
    if (this.adminId) {
      this.storeService.dispatch(findAdminById({ adminId: this.adminId }));
    }
  }

  onEdit(): void {
    if (this.adminId) {
      this.router.navigate(['/admin/admins/edit', this.adminId]);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/admins']);
  }
}

