import { Component, OnInit, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfigService } from 'src/app/core/services/config.service';
import { EventService } from 'src/app/core/services/event.service';
import { ChartType } from './dashboard.model';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectDemandeState, selectProfileState } from 'src/app/core/core.state';
import { DemandeState } from 'src/app/core/shared/stores/demande/demande.state';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  modalRef?: BsModalRef;
  isVisible!: string;

  emailSentBarChart!: ChartType;
  monthlyEarningChart!: ChartType;
  transactions: any;
  statData: any;

  isActive!: string;

  profileState$: Observable<ProfileState>;

  demande$: Observable<DemandeState>;

  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  
  

  @ViewChild('content') content: any;
  constructor(
    private modalService: BsModalService, 
    private configService: ConfigService, 
    private eventService: EventService,
    private storeService: Store,
  ) {
  }

  ngOnInit() {

    this.profileState$ = this.storeService.select(selectProfileState);


    this.demande$ = this.storeService.select(selectDemandeState).pipe();
    

    /**
     * horizontal-vertical layput set
     */
     const attribute = document.body.getAttribute('data-layout');

     this.isVisible = attribute || '';
     const vertical = document.getElementById('layout-vertical');
     if (vertical != null) {
       vertical.setAttribute('checked', 'true');
     }
     if (attribute == 'horizontal') {
       const horizontal = document.getElementById('layout-horizontal');
       if (horizontal != null) {
         horizontal.setAttribute('checked', 'true');
         console.log(horizontal);
       }
     }

    /**
     * Fetches the data
     */
    this.fetchData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.openModal();
    }, 2000);
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    this.emailSentBarChart = emailSentBarChart;
    this.monthlyEarningChart = monthlyEarningChart;

    this.isActive = 'year';
    this.configService.getConfig().subscribe(data => {
      this.transactions = data.transactions;
      this.statData = data.statData;
    });
  }

  openModal() {
    // this.modalRef = this.modalService.show(this.content, { class: 'center' });
  }

  weeklyreport() {
    this.isActive = 'week';
    this.emailSentBarChart.series =
      [{
        name: 'Demande',
         data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Devis',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, 
      // {
      //   name: 'Series C',
      //   data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      // }
    ];
  }

  monthlyreport() {
    this.isActive = 'month';
    this.emailSentBarChart.series =
      [{
        name: 'Demande',
         data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Devis',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, 
      // {
      //   name: 'Series C',
      //   data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      // }
    ];
  }

  yearlyreport() {
    this.isActive = 'year';
    this.emailSentBarChart.series =
      [{
        name: 'Demande',
         data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Devis',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, 
      // {
      //   name: 'Series C',
      //   data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      // }
    ];
  }


  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
