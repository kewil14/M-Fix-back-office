import { Component, OnInit } from '@angular/core';
import { APP_ENUMS } from 'src/app/core/config/app.enums.config';

@Component({
  selector: 'mfix-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  app_enum: typeof  APP_ENUMS = APP_ENUMS;
  year: number = new Date().getFullYear();

  

  constructor() { }

  ngOnInit() {
  }

}
