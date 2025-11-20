import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectShopState } from 'src/app/core/core.state';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { findShopById } from 'src/app/core/shared/stores/shop/shop.actions';
import { ShopState } from 'src/app/core/shared/stores/shop/shop.state';

@Component({
  selector: 'app-shop-detail',
  templateUrl: './shop-detail.component.html',
  styleUrls: ['./shop-detail.component.scss']
})
export class ShopDetailComponent implements OnInit, OnDestroy {
  shopState$!: Observable<ShopState>;
  shop: ShopResponseDto | null = null;
  shopId: string | null = null;
  subscriptions: Subscription[] = [];
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  breadCrumbItems: Array<{}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.ADMIN') },
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.SHOPS'), routerLink: '/admin/shops' },
      { label: this.translateService.instant('MESSAGES.ADMIN.SHOP.DETAILS'), active: true }
    ];
    this.shopState$ = this.storeService.select(selectShopState).pipe();
    
    this.subscriptions.push(
      this.shopState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.shop) {
          if (!this.shopId || state.shop.id === this.shopId) {
            this.shop = state.shop;
          }
        }
      })
    );
    
    this.route.paramMap.subscribe(params => {
      this.shopId = params.get('id');
      if (this.shopId) {
        this.loadShop();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadShop(): void {
    if (this.shopId) {
      this.storeService.dispatch(findShopById({ shopId: this.shopId }));
    }
  }

  onEdit(): void {
    if (this.shopId) {
      this.router.navigate(['/admin/shops/edit', this.shopId]);
    }
  }
}

