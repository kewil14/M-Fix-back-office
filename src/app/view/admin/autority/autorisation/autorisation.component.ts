import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum, OperationEnum } from 'src/app/core/config/data.state.enum';
import { selectRoleState } from 'src/app/core/core.state';
import { AutorisationResponseDto } from 'src/app/core/shared/dtos/autorisation-response-dto';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { erreurRoles, setRoleItem } from 'src/app/core/shared/stores/role/role.actions';
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


  constructor(
    private storeService: Store,
    private localStorageService: LocalStorageService,
    private actionService: Actions,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.getTitlePath();
    this.roleState$ = this.storeService.select(selectRoleState).pipe();
    this.dtOptions = this.localStorageService.dbOptions();
    // this.loadAuthorities();
    this.actionAuthority();
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

  
//  you need to remove it
  seeAuthority(autority: AutorisationResponseDto) {
    this.authority$.next({authority: autority, operation: OperationEnum.UPDATE});
    this.loading$.next(false);
    this.isEdit = true;
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


