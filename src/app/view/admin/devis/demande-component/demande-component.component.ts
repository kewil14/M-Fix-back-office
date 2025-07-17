import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { selectDemandeState } from 'src/app/core/core.state';
import { DemandeState } from 'src/app/core/shared/stores/demande/demande.state';
import { AdvancedSortableDirective, SortEvent } from 'src/app/pages/tables/advancedtable/advanced-sortable.directive';
import { Table } from 'src/app/pages/tables/advancedtable/advanced.model';
import { AdvancedService } from 'src/app/pages/tables/advancedtable/advanced.service';
import { tableData } from 'src/app/pages/tables/advancedtable/data';

@Component({
  selector: 'app-demande-component',
  templateUrl: './demande-component.component.html',
  styleUrls: ['./demande-component.component.css'],
  
})
export class DemandeComponentComponent implements OnInit {
  // bread crum data
  breadCrumbItems!: Array<{}>;
  // Table data
  tableData!: Table[];
  public selected: any;
  hideme: boolean[] = [];
  tables$: Observable<Table[]>;
  total$: Observable<number>;

  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  

  demande$: Observable<DemandeState>;

  @ViewChildren(AdvancedSortableDirective) headers!: QueryList<AdvancedSortableDirective>;
  public isCollapsed = true;

  constructor(
    public service: AdvancedService,
    public storeService: Store,
  ) {
    this.tables$ = service.tables$;
    this.total$ = service.total$;
  }

  ngOnInit() {

    this.demande$ = this.storeService.select(selectDemandeState).pipe();
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Advanced Table', active: true }];
    /**
     * fetch data
     */
    this._fetchData();
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
