import { Component, OnInit } from '@angular/core';
import { APP_ENUMS } from 'src/app/core/config/app.enums.config';

@Component({
  selector: 'willo-footer-shared',
  templateUrl: './footer-shared.component.html',
  styleUrls: ['./footer-shared.component.scss']
})
export class FooterSharedComponent implements OnInit {
  app_enum: typeof  APP_ENUMS = APP_ENUMS;
  year: number = new Date().getFullYear();

  

  constructor() { }

  ngOnInit() {
  }

}
