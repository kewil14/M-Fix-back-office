import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectShopState } from 'src/app/core/core.state';
import { ShopListRequestDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { DeleteConfirmModalComponent } from 'src/app/shared-module/components/delete-confirm-modal/delete-confirm-modal.component';
import {
  findAllShops,
  deleteShop,
  reactivateShop,
  erreurShops,
  addShop,
  loadShops
} from 'src/app/core/shared/stores/shop/shop.actions';
import { ShopState } from 'src/app/core/shared/stores/shop/shop.state';
import { CreateShopComponent } from './create-shop/create-shop.component';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  breadCrumbItems!: Array<{}>;
  shopState$!: Observable<ShopState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  subscriptions: Subscription[] = [];
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  searchTerm: string = '';
  workspaceIdFilter: string = '';
  isActiveFilter: boolean | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: string = 'createdAt';
  sortDirection: string = 'desc';

  constructor(
    private modalService: BsModalService,
    private storeService: Store,
    private actionService: Actions,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.breadCrumbItems = [
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.ADMIN') }, 
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.SHOPS'), active: true }
    ];
    this.shopState$ = this.storeService.select(selectShopState).pipe();
    this.actionShops();
    this.loadShops();
  }

  actionShops() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurShops)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(addShop)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.SHOP_CREATE'), dismissible: false}
        );
        setTimeout(() => {
          this.loadShops();
        }, 1000);
      }),
      this.actionService.pipe(ofType(loadShops)).subscribe(() => {
      })
    );
  }

  loadShops() {
    const filters: ShopListRequestDto = {
      search: this.searchTerm || undefined,
      workspaceId: this.workspaceIdFilter || undefined,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.storeService.dispatch(findAllShops({ filters }));
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadShops();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadShops();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadShops();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadShops();
  }

  getPageNumbers(state: ShopState): number[] {
    if (!state || state.totalPages === 0) return [];
    const pages: number[] = [];
    const maxPages = Math.min(5, state.totalPages);
    let startPage = Math.max(0, state.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(state.totalPages - 1, startPage + maxPages - 1);
    
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
    this.modalRef = this.modalService.show(CreateShopComponent, { 
      class: 'modal-lg',
      backdrop: true,
      ignoreBackdropClick: true
    });
  }

  onView(shop: ShopResponseDto): void {
    if (shop.id) {
      this.router.navigate(['/admin/shops/detail', shop.id]);
    }
  }

  onEdit(shop: ShopResponseDto): void {
    if (shop.id) {
      this.router.navigate(['/admin/shops/edit', shop.id]);
    }
  }

  onDelete(shop: ShopResponseDto): void {
    const initialState = {
      title: this.translateService.instant('MESSAGES.ADMIN.SHOP.DELETE_TITLE'),
      message: this.translateService.instant('MESSAGES.ADMIN.SHOP.DELETE_MESSAGE'),
      itemName: shop.name,
      confirmBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.DELETE_BUTTON'),
      cancelBtnText: this.translateService.instant('MESSAGES.ADMIN.SHOP.CANCEL')
    };
    
    this.modalRef = this.modalService.show(DeleteConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered'
    });
    
    if (this.modalRef.content) {
      this.modalRef.content.onConfirm.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.storeService.dispatch(deleteShop({ shopId: shop.id }));
          setTimeout(() => {
            this.loadShops();
          }, 1000);
        }
      });
    }
  }

  onReactivate(shop: ShopResponseDto): void {
    this.storeService.dispatch(reactivateShop({ shopId: shop.id }));
    setTimeout(() => {
      this.loadShops();
    }, 1000);
  }
}

