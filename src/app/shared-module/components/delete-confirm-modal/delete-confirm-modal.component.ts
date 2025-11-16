import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-delete-confirm-modal',
  templateUrl: './delete-confirm-modal.component.html',
  styleUrls: ['./delete-confirm-modal.component.scss']
})
export class DeleteConfirmModalComponent implements OnInit {
  title: string = 'Confirmer la suppression';
  message: string = 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.';
  itemName?: string;
  confirmBtnText: string = 'Supprimer';
  cancelBtnText: string = 'Annuler';
  confirmBtnClass: string = 'btn-danger';
  
  public onConfirm: Subject<boolean> = new Subject<boolean>();

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit(): void {
  }

  confirm(): void {
    this.onConfirm.next(true);
    this.bsModalRef.hide();
  }

  decline(): void {
    this.onConfirm.next(false);
    this.bsModalRef.hide();
  }
}

