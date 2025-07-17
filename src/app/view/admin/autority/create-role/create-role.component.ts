import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OperationEnum } from 'src/app/core/config/data.state.enum';
import { RoleFin } from 'src/app/core/shared/models/users/role-fin.modal';
import { RoleItem } from 'src/app/core/shared/models/users/role-item.modal';
import { setRole } from 'src/app/core/shared/stores/role/role.actions';

@Component({
  selector: 'loto-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent implements OnInit, OnDestroy {

  role$ = new BehaviorSubject<{role: RoleFin, operation: string}>({role: {}, operation: OperationEnum.CREATE});
  loadingRole$ = new BehaviorSubject<boolean>(false);
  subscriptions: Subscription[] = [];
  roleGrantedAuthorities$ = new BehaviorSubject<Array<RoleItem>>([]);
  currentAuthorities: Array<RoleItem> = [];
  currentAuthorities$ = new BehaviorSubject<Array<RoleItem>>([]);
  
  constructor(
    private storeService: Store,
    private actionsService: Actions,
    // private modalService: NgbModal,
  ) {}
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  
  ngOnInit(): void {
    this.actionRoles();
  }

  actionRoles(): void {
    this.subscriptions.push(
      this.actionsService.pipe(ofType(setRole)).subscribe(({role}) => {
        this.role$.next({role: role, operation: OperationEnum.UPDATE});
        this.loadingRole$.next(false);
        this.currentAuthorities = role.authorisations || [];
        this.currentAuthorities$.next(this.currentAuthorities);
      }),
    )
  }

  createRoleAction($event: {role: RoleFin, operation: any}): void {
    if($event.operation == OperationEnum.CREATE) {
      // this.storeService.dispatch(createRoleAdmin({role: {...$event.role, roles: this.currentAuthorities}}));
    } else {
      // this.storeService.dispatch(updateRole({role: {...$event.role, roles: this.currentAuthorities}}));
    }
  }

  openXlModal(templateView: any) {
    this.roleGrantedAuthorities$.next(this.currentAuthorities);
    // this.modalService.open(templateView, { size: 'xl', centered: true });
  }

  onListAuthority($event: Array<RoleItem>): void {
    this.currentAuthorities = $event;
    // this.modalService.dismissAll();
    this.currentAuthorities$.next($event);
  }
  

}
