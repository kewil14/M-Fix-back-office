import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectDevisState } from 'src/app/core/core.state';
import { DevisState } from 'src/app/core/shared/stores/devis/devis.state';
import { AdvancedSortableDirective, SortEvent } from 'src/app/pages/tables/advancedtable/advanced-sortable.directive';
import { Table } from 'src/app/pages/tables/advancedtable/advanced.model';
import { AdvancedService } from 'src/app/pages/tables/advancedtable/advanced.service';
import { tableData } from 'src/app/pages/tables/advancedtable/data';

@Component({
  selector: 'app-devis-component',
  templateUrl: './devis-component.component.html',
  styleUrls: ['./devis-component.component.css']
})
export class DevisComponentComponent implements OnInit {
  // bread crum data
  breadCrumbItems!: Array<{}>;
  // Table data
  tableData!: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  devisState$: Observable<DevisState>;

  @ViewChildren(AdvancedSortableDirective) headers!: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;

  isLoadingList: boolean = false;

  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  

  constructor(
    public service: AdvancedService,
    public storeService: Store,

  ) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  ngOnInit() {
    this.isLoadingList = !this.isLoadingList;
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Advanced Table', active: true }];
    /**
     * fetch data
     */
    this._fetchData();

    this.devisState$ = this.storeService.select(selectDevisState).pipe();
  }

  changeValue(i: any) {
    this.hideme[i] = !this.hideme[i];
  }


  /**
   * fetches the table value
   */
  _fetchData() {
    this.tableData = tableData;
    for (let i = 0; i <= this.tableData.length; i++) {
      this.hideme.push(true);
    }
  }

  /**
   * Sort table data
   * @param param0 sort the column
   *
   */
  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}
