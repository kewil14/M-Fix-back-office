import { Component, OnInit, Input, EventEmitter, ViewChild, Output } from '@angular/core';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

/**
 * Projects-create component
 */
export class CreateComponent implements OnInit {

  constructor() { }
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  selected: any;
  hidden!: boolean;

  @Input() fromDate!: Date;
  @Input() toDate!: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  @ViewChild('dp', { static: true }) datePicker: any;

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Create New', active: true }];

    this.selected = '';
    this.hidden = true;
  }


}
