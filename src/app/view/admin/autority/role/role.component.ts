import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectRoleState } from 'src/app/core/core.state';
import { GroupItemsFinDto } from 'src/app/core/shared/dtos/group-items-fin-dto.modal';
import { RoleResponseDto } from 'src/app/core/shared/dtos/role-response-dto';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { RoleService } from 'src/app/core/shared/services/role.service';
import { deleteRole, erreurRoles } from 'src/app/core/shared/stores/role/role.actions';
import { RoleState } from 'src/app/core/shared/stores/role/role.state';

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

  constructor(
    private localStorageService: LocalStorageService,
    private storeService: Store,
    private router: Router,
    private actionService: Actions,
    private roleService: RoleService
    ){}
    ngOnDestroy(): void {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
    
  

  ngOnInit(): void {
    this.getTitlePattern();
    this.dbOptions = this.localStorageService.dbOptions();
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    // this.loadRoles();
    this.actionRole();
    
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

  onDelete(role:RoleResponseDto){
    this.storeService.dispatch(deleteRole({role}))
  }

  onAddRole(){
    this.router.navigateByUrl('/admin/authorizations/roles/add-role');
  }


  onSee(role: RoleResponseDto) {
  this.isEdit = ! this.isEdit;
  // console.log('test edit');
  this.availableGroupAuthorities$ = this.roleService.getListFin(role.authorisations || []);
  }
}
