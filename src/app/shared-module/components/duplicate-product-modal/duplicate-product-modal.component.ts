import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

export interface DuplicateProductOptions {
  new_label: string;
  copy_stock: boolean;
  copy_reviews: boolean;
  copy_images: boolean;
}

@Component({
  selector: 'app-duplicate-product-modal',
  templateUrl: './duplicate-product-modal.component.html',
  styleUrls: ['./duplicate-product-modal.component.scss']
})
export class DuplicateProductModalComponent implements OnInit {
  title: string = 'Dupliquer le produit';
  productLabel: string = '';
  newLabel: string = '';
  copyStock: boolean = false;
  copyReviews: boolean = false;
  copyImages: boolean = true;
  confirmBtnText: string = 'Dupliquer';
  cancelBtnText: string = 'Annuler';
  
  public onConfirm: Subject<DuplicateProductOptions> = new Subject<DuplicateProductOptions>();

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
    // Générer un label par défaut si non fourni
    if (!this.newLabel && this.productLabel) {
      this.newLabel = `${this.productLabel} (Copie)`;
    }
  }

  confirm(): void {
    if (!this.newLabel.trim()) {
      return;
    }
    this.onConfirm.next({
      new_label: this.newLabel.trim(),
      copy_stock: this.copyStock,
      copy_reviews: this.copyReviews,
      copy_images: this.copyImages
    });
    this.bsModalRef.hide();
  }

  decline(): void {
    this.bsModalRef.hide();
  }
}

