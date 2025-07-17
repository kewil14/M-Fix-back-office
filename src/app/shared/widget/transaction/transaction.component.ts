import { Component, OnInit, Input } from '@angular/core';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { DemandeState } from 'src/app/core/shared/stores/demande/demande.state';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  modalRef?: BsModalRef;

  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  demande$: Observable<DemandeState>;
  
  

  @Input() transactions!: Array<{
    id?: string;
    index?: number,
    name?: string,
    date?: string,
    total?: string,
    status?: string,
    payment?: string[],
  }>;

  constructor(private modalService: BsModalService) { }

  ngOnInit() {
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }

}
