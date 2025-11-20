import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { APP_COLORS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectShopState } from 'src/app/core/core.state';
import { UpdateShopDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { findShopById, updateShop, setShop, erreurShops } from 'src/app/core/shared/stores/shop/shop.actions';
import { ShopState } from 'src/app/core/shared/stores/shop/shop.state';

@Component({
  selector: 'app-shop-edit',
  templateUrl: './shop-edit.component.html',
  styleUrls: ['./shop-edit.component.scss']
})
export class ShopEditComponent implements OnInit, OnDestroy {
  shopForm: FormGroup;
  submitted = false;
  shopId: string | null = null;
  
  shopState$!: Observable<ShopState>;
  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  subscriptions: Subscription[] = [];
  
  messages$ = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>(
    {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: '', dismissible: false}
  );

  breadCrumbItems: Array<{}> = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: Store,
    private actionService: Actions,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.ADMIN') },
      { label: this.translateService.instant('MESSAGES.ADMIN.COMMON.SHOPS'), routerLink: '/admin/shops' },
      { label: this.translateService.instant('MESSAGES.ADMIN.SHOP.EDIT'), active: true }
    ];
    this.shopState$ = this.storeService.select(selectShopState).pipe();
    this.initForm();
    this.actionShop();
    
    this.route.paramMap.subscribe(params => {
      this.shopId = params.get('id');
      if (this.shopId) {
        this.loadShop();
      }
    });

    this.subscriptions.push(
      this.shopState$.subscribe(state => {
        if (state.dataState === DataStateEnum.SUCCESS && state.shop) {
          if (state.shop.id === this.shopId) {
            this.populateForm(state.shop);
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.shopForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      address: [''],
      city: [''],
      postalCode: [''],
      country: [''],
      phoneNumber: [''],
      email: ['', [Validators.email]],
      isActive: [true]
    });
  }

  populateForm(shop: any) {
    this.shopForm.patchValue({
      name: shop.name || '',
      address: shop.address || '',
      city: shop.city || '',
      postalCode: shop.postalCode || '',
      country: shop.country || '',
      phoneNumber: shop.phoneNumber || '',
      email: shop.email || '',
      isActive: shop.isActive !== undefined ? shop.isActive : true
    });
  }

  loadShop(): void {
    if (this.shopId) {
      this.storeService.dispatch(findShopById({ shopId: this.shopId }));
    }
  }

  actionShop() {
    this.subscriptions.push(
      this.actionService.pipe(ofType(erreurShops)).subscribe(({messages}) => {
        this.messages$.next(
          {type: {icon: APP_ICONS.DANGER, color: APP_COLORS.DANGER}, title: APP_COLORS.DANGER, message: messages, dismissible: false}
        );
      }),
      this.actionService.pipe(ofType(setShop)).subscribe(() => {
        this.messages$.next(
          {type: {icon: APP_ICONS.SUCCESS, color: APP_COLORS.SUCCESS}, title: APP_COLORS.SUCCESS, message: this.translateService.instant('MESSAGES.SUCCESS_ACTION.SHOP_UPDATE'), dismissible: false}
        );
        setTimeout(() => {
          this.router.navigate(['/admin/shops']);
        }, 1000);
      })
    );
  }

  get f() { return this.shopForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.shopForm.invalid || !this.shopId) {
      return;
    }

    const formValue = this.shopForm.value;
    const updateShopDto: UpdateShopDto = {
      name: formValue.name,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      postalCode: formValue.postalCode || undefined,
      country: formValue.country || undefined,
      phoneNumber: formValue.phoneNumber || undefined,
      email: formValue.email || undefined,
      isActive: formValue.isActive
    };

    this.storeService.dispatch(updateShop({ shopId: this.shopId, updateShopDto }));
  }

  onCancel() {
    this.router.navigate(['/admin/shops']);
  }
}

