import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ProductService } from 'src/app/core/shared/services/product.service';
import { WorkspaceService, WorkspaceDto } from 'src/app/core/shared/services/workspace.service';
import { ShopService } from 'src/app/core/shared/services/shop.service';
import { ShopResponseDto } from 'src/app/core/shared/dtos/shop-response-dto';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-addproduct',
  templateUrl: './addproduct.component.html',
  styleUrls: ['./addproduct.component.scss']
})

/**
 * Ecommerce add-product component
 */
export class AddproductComponent implements OnInit {

  constructor(
    public formBuilder: UntypedFormBuilder,
    private http: HttpClient, // Keep http for now, but will switch to productService
    private productService: ProductService,
    private workspaceService: WorkspaceService,
    private shopService: ShopService
  ) { }
  /**
   * Returns form
   */
  get form() {
    return this.productForm.controls;
  }

  productForm!: UntypedFormGroup;

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  // Form submition
  submit!: boolean;

  config: DropzoneConfigInterface = {
    // Change this to your upload POST address:
    maxFilesize: 50,
    acceptedFiles: 'image/*',
    method: 'POST',
    uploadMultiple: false,
    accept: (file) => {
      this.onAccept(file);
    }
  };
  image = '';
  file = '';

  workspaces$: Observable<WorkspaceDto[]> = of([]);
  shops$: BehaviorSubject<ShopResponseDto[]> = new BehaviorSubject([]);

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Ecommerce' }, { label: 'Add Product', active: true }];

    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      manufacture_name: ['', [Validators.required]],
      manufacture_brand: ['', [Validators.required]],
      price: ['', [Validators.required]],
      workspaceId: ['', [Validators.required]],
      shopId: [{value: '', disabled: true}, [Validators.required]],
    });
    this.submit = false;

    this.loadWorkspaces();
    this.productForm.get('workspaceId')?.valueChanges.subscribe(() => {
      this.onWorkspaceChange();
    });
  }

  loadWorkspaces(): void {
    this.workspaces$ = this.workspaceService.findAllWorkspaces().pipe(
      map(response => response.status === 'SUCCESS' ? response.data : [])
    );
  }

  onWorkspaceChange(): void {
    const workspaceId = this.form.workspaceId.value;
    const shopControl = this.form.shopId;
    
    this.shops$.next([]);
    shopControl.reset({value: '', disabled: true});

    if (workspaceId) {
      shopControl.enable();
      this.shopService.getShopsByWorkspace(workspaceId).subscribe(response => {
        if (response.status === 'SUCCESS') {
          this.shops$.next(response.data);
        }
      });
    }
  }

  onAccept(file: any) {
    this.image = file.name;
    this.file = file;
  }
  /**
   * Bootsrap validation form submit method
   */
  validSubmit() {
    this.submit = true;
    if (this.productForm.invalid) {
      return;
    }

    const productPayload = {
      name: this.productForm.get('name')?.value,
      manufacture_name: this.productForm.get('manufacture_name')?.value,
      manufacture_brand: this.productForm.get('manufacture_brand')?.value,
      price: this.productForm.get('price')?.value,
      workspace_id: this.productForm.get('workspaceId')?.value,
      shop_id: this.productForm.get('shopId')?.value,
      // Add other fields as needed, e.g., description, category, etc.
      // For now, just including the basic ones and the new workspace/shop IDs
    };

    // Assuming ProductService.createProduct expects an object, not FormData
    this.productService.createProduct(productPayload).subscribe({
      next: (res) => {
        console.log('Product created successfully:', res);
        // Handle success, e.g., show a success message, redirect
      },
      error: (err) => {
        console.error('Error creating product:', err);
        // Handle error, e.g., show an error message
      }
    });
  }
}
