import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'loto-message-alert',
  templateUrl: './message-alert.component.html',
  styleUrls: ['./message-alert.component.scss']
})
export class MessageAlertComponent implements OnInit{

  @Input() messages$: BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}> 
            = new BehaviorSubject<{type: {icon: any, color: any}, title: any, message: any, dismissible: boolean}>({type: {icon: 'ri-error-warning-line', color: 'danger'}, title: 'danger', message: 'hello', dismissible: false});

  constructor() {}

  ngOnInit(): void {
  }

}
