import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription, from, groupBy, map, mergeMap, of, take, toArray, zip } from 'rxjs';
import { selectRoleState } from 'src/app/core/core.state';
import { GroupItemsFinDto } from 'src/app/core/shared/dtos/group-items-fin-dto.modal';
import { RoleItem } from 'src/app/core/shared/models/users/role-item.modal';
import { RoleService } from 'src/app/core/shared/services/role.service';

@Component({
  selector: 'loto-manage-authority',
  templateUrl: './manage-authority.component.html',
  styleUrls: ['./manage-authority.component.scss']
})
export class ManageAuthorityComponent implements OnInit, OnDestroy {
  
  @Input() roleGrantedAuthorities$!: BehaviorSubject<Array<RoleItem>>;
  @Output() onListAuthority = new EventEmitter<RoleItem[]>();
  
  listAuthorities: Array<RoleItem> = [];

  availableAuthorities: Array<RoleItem> = [];
  grantedAuthorities: Array<RoleItem> = [];

  availableGroupAuthorities$!: Observable<Array<GroupItemsFinDto>>;
  grantedGroupAuthorities$!: Observable<Array<GroupItemsFinDto>>;

  isLoading: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(
    private storeService: Store,
    private roleService: RoleService,
    private actionService: Actions,
  ) { }


  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    this.storeService.select(selectRoleState).pipe(map(({ruleItems}) => ruleItems)).subscribe( roles => this.listAuthorities = roles);

    this.roleGrantedAuthorities$.subscribe(items => this.initList(items))
  }

  

  initList(items: Array<RoleItem>): void {
    if(items.length == 0) this.availableAuthorities = this.listAuthorities;
    else {
      this.availableAuthorities = [];
      this.listAuthorities.forEach(authority => {
        var exist = false;
        items.forEach(roleItem => {
          if(roleItem.authorisationKey == authority.authorisationKey) exist = true;
        })
        if(!exist) this.availableAuthorities.push(authority);
      })
    }
    this.grantedAuthorities = [...items];
    this.grantedGroupAuthorities$ = this.roleService.getListFin(items);
    this.availableGroupAuthorities$ = this.roleService.getListFin(this.availableAuthorities);
    console.log(this.availableAuthorities)
  }
  

  addGroupAuthority(group: GroupItemsFinDto): void {
    this.grantedAuthorities.push(...group.items || []);
    this.initList(this.grantedAuthorities);
  }

  deleteGroupAuthority(group: GroupItemsFinDto): void {
    var list: Array<RoleItem> = [];

    this.grantedAuthorities.forEach(gr => {
      var exist = false;
      group.items?.forEach(i => {
        if(gr.authorisationKey == i.authorisationKey) exist = true;
      });
      if(!exist) list.push(gr);
    })

    this.initList(list);

  }

  addItem(item: RoleItem): void{
    this.grantedAuthorities.push(item);
    this.initList(this.grantedAuthorities);
  }

  deleteItem(item: RoleItem) {
    this.initList(this.grantedAuthorities.filter(itemRole => itemRole.authorisationKey != item.authorisationKey));  
  }

  saveAuthority(): void {
    this.isLoading = true;
    setTimeout(() => {
    this.isLoading = false;
      this.onListAuthority.emit(this.grantedAuthorities);
    },1000);
  }

}
