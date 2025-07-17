import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { interval, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { APP_ENUMS, APP_ICONS } from 'src/app/core/config/app.enums.config';
import { ProfileState } from 'src/app/core/shared/stores/profile/profile.state';
import { Store } from '@ngrx/store';
import { selectAvisState, selectDevisState, selectProfileState, selectUserState } from 'src/app/core/core.state';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';
import { setUserProfile } from 'src/app/core/shared/stores/profile/profile.actions';
import { CountryEnum, ListRoles, UserTypeEnum } from 'src/app/core/config/list-roles';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { Router } from '@angular/router';
import { AvisState } from 'src/app/core/shared/stores/avis/avis.state';
import { UserState } from 'src/app/core/shared/stores/user/user.state';
import { DevisState } from 'src/app/core/shared/stores/devis/devis.state';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DecimalPipe } from '@angular/common';
import { CustomersService } from 'src/app/pages/ecommerce/customers/customers.service';
import { addAvis, createAvis, erreurAvis } from 'src/app/core/shared/stores/avis/avis.actions';
import { Actions, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { Formule } from 'src/app/core/models/formule';
import { AvisRequestDto } from 'src/app/core/shared/dtos/avis-request-dto.modal';
import { addUser, createUser } from 'src/app/core/shared/stores/user/user.actions';
import { UserRequestDto } from 'src/app/core/shared/dtos/user-request-dto.modal';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [CustomersService, DecimalPipe],
  animations: [
    trigger('fadeInLeft', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate(600)
      ])
    ]),
    trigger('fadeInRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate(600)
      ])
    ])
  ]
})

export class HomeComponent implements AfterViewInit, OnInit, OnDestroy {
   
  
  readRate = 3;
  year: number = new Date().getFullYear();
  currentSection = 'home';
  app_enum: typeof APP_ENUMS = APP_ENUMS;
  app_icons: typeof APP_ICONS = APP_ICONS;

  submitted = false;

  formData: FormGroup;

  formuleSelectionnee?: Formule;

  formules: Formule[] = [
    {
      id: 'eco',
      nom: 'Formule Éco',
      description: 'Service minimaliste, idéal pour les petits budgets.',
      image: 'assets/imageswillo/07.jpg',
      details: {
        prix: 'À partir de 150€',
        duree: '4-6 heures',
        services: [
          'Transport uniquement',
          'Camion de déménagement',
          'Chauffeur professionnel'
        ],
        avantages: [
          'Prix abordable',
          'Flexible sur les horaires',
          'Idéal pour petits volumes'
        ]
      }
    },
    {
      id: 'standard',
      nom: 'Formule Standard',
      description: 'Un déménagement avec aide à l\'emballage et au transport.',
      image: 'assets/imageswillo/progress.jpg',
      details: {
        prix: 'À partir de 350€',
        duree: '6-8 heures',
        services: [
          'Aide à l\'emballage',
          'Transport sécurisé',
          '2 déménageurs professionnels',
          'Matériel de protection fourni'
        ],
        avantages: [
          'Rapport qualité-prix optimal',
          'Équipe expérimentée',
          'Matériel d\'emballage inclus',
          'Assurance de base'
        ]
      }
    },
    {
      id: 'premium',
      nom: 'Formule Premium',
      description: 'Prise en charge complète avec services supplémentaires.',
      image: 'assets/imageswillo/get_quote.jpg',
      details: {
        prix: 'À partir de 550€',
        duree: '1 journée complète',
        services: [
          'Emballage complet',
          'Démontage/Remontage meubles',
          '3 déménageurs professionnels',
          'Nettoyage de fin de bail',
          'Garde-meuble temporaire'
        ],
        avantages: [
          'Service clé en main',
          'Assurance tous risques',
          'Suivi personnalisé',
          'Garantie satisfaction'
        ]
      }
    },
    {
      id: 'luxe',
      nom: 'Formule Luxe',
      description: 'Déménagement VIP avec service personnalisé et premium.',
      image: 'assets/imageswillo/20.jpg',
      details: {
        prix: 'Sur devis personnalisé',
        duree: 'Selon vos besoins',
        services: [
          'Coordinateur dédié',
          'Emballage objets précieux',
          'Équipe spécialisée',
          'Transport climatisé',
          'Installation complète',
          'Service conciergerie'
        ],
        avantages: [
          'Service ultra-personnalisé',
          'Équipe dédiée exclusivement',
          'Assurance premium',
          'Disponibilité 7j/7',
          'Suivi en temps réel'
        ]
      }
    }
  ];

  clearRate = 2;
  readonly = false;

  subscriptions: Subscription[] = [];

  // Propriétés pour les images et styles
  servicesImage = '../../../../assets/images/bg-for white place.png';
  backgroundClass = 'bg-with-image';
  animationState = 'in';
  


  profileState$: Observable<ProfileState>;
  avisState$: Observable<AvisState>;
  customerState$: Observable<UserState>;
  devisState$: Observable<DevisState>;


  isMenuOpen = false;

  // Vos autres propriétés existantes...
 
  // Votre service
  dataStateEnum = DataStateEnum; // Votre enum
  listRoles = ListRoles; // Votre enum des rôles

  captchaValid: boolean = false;



  carouselOption: OwlOptions = {
    items: 1,
    loop: false,
    margin: 24,
    nav: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    responsive: {
      672: { items: 3 },
      912: { items: 4 },
    }
  };

  timelineCarousel: OwlOptions = {
    items: 1,
    loop: false,
    margin: 0,
    nav: true,
    navText: ["<i class='mdi mdi-chevron-left'></i>", "<i class='mdi mdi-chevron-right'></i>"],
    dots: false,
    responsive: {
      672: { items: 3 },
      576: { items: 2 },
      936: { items: 4 },
    }
  };

  private _trialEndsAt;
  private _diff: number;
  _days: number;
  _hours: number;
  _minutes: number;
  _seconds: number;

  @ViewChildren('counter') counters!: QueryList<ElementRef>;


  modalRef?: BsModalRef;

  counter = 1;
  

  constructor(
    private fb: FormBuilder,
    private storeService: Store,
    private localStorageService: LocalStorageService,
    private router: Router,
    private modalService: BsModalService,
    private actionService: Actions,
    private toastr:ToastrService,
  ) {}


  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
   };

  ngOnInit() {

    this.initForm();


    this.avisState$ = this.storeService.select(selectAvisState).pipe();
    
    this.storeService.dispatch(setUserProfile({user: this.localStorageService.currentUserValue}));

    this.customerState$ = this.storeService.select(selectUserState).pipe();
    
    this.devisState$ = this.storeService.select(selectDevisState).pipe();

    // je recupere le profile state
    this.profileState$ = this.storeService.select(selectProfileState).pipe();


    this.actionHomeState();
    
    this._trialEndsAt = "2022-12-31";

    interval(3000).pipe(
      map(() => {
        this._diff = Date.parse(this._trialEndsAt) - Date.parse(new Date().toString());
      })
    ).subscribe(() => {
      this._days = this.getDays(this._diff);
      this._hours = this.getHours(this._diff);
      this._minutes = this.getMinutes(this._diff);
      this._seconds = this.getSeconds(this._diff);
    });

    // Faire varier les images suivant un intervalle de temps
    const slides = document.querySelectorAll('.hero-slider-background .slide') as NodeListOf<HTMLElement>;
    let index = 0;
    setInterval(() => {
      slides[index].classList.remove('active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('active');
    }, 8000);


    
  }


  actionHomeState(): void {
    this.subscriptions.push(
      this.actionService.pipe(ofType(addAvis)).subscribe((s) => {
        this.toastr.success('Hello, Merci d\'avoir ajoute votre avis.', 'willo');
        // this.toastr.error('Vous devez vous connecter pour ajouter un avis.', 'willo');

        if (s) {
          this.modalRef?.hide();
          this.clear();
        }
      }),

      this.actionService.pipe(ofType(erreurAvis)).subscribe((s) => {
        this.toastr.error('Vous devez vous connecter pour ajouter un avis.', 'willo');
      }),

      this.actionService.pipe(ofType(addUser)).subscribe(({user}) => {

        let avis: AvisRequestDto =  {
        note: this.formData.value.note,
        description: this.formData.value.description,
        userId: user.userCode
        };
        // dispacher l'action de create de grille tarifaire
        this.storeService.dispatch(createAvis({avis: avis}));
      })
    )
  }


  initForm(): void{
      this.formData  = this.fb.group({
        note: ['', [Validators.required]],
        description: ['', [Validators.required]],
      });
  }

  get form() {
    return this.formData.controls;
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    this.counters.forEach(counter => {
      observer.observe(counter.nativeElement);
    });
  }

  animateCounters() {
    this.counters.forEach(counter => {
      const target = +counter.nativeElement.getAttribute('data-target');
      let count = 0;
      const speed = 200;
      const increment = Math.ceil(target / speed);

      const updateCount = () => {
        count += increment;
        if (count < target) {
          counter.nativeElement.innerText = count;
          setTimeout(updateCount, 10);
        } else {
          counter.nativeElement.innerText = target;
        }
      };
      updateCount();
    });
  }

  handleCaptcha(response: string) {
    this.captchaValid = !!response;
  }

  submitForm() {
    if (!this.captchaValid) {
      alert("Veuillez valider le reCAPTCHA !");
      return;
    }
    // console.log("Formulaire soumis :", this.contactForm.value);
    alert("Votre message a bien été envoyé !");
  }

  getDays(t) { return Math.floor(t / (1000 * 60 * 60 * 24)); }
  getHours(t) { return Math.floor((t / (1000 * 60 * 60)) % 24); }
  getMinutes(t) { return Math.floor((t / 1000 / 60) % 60); }
  getSeconds(t) { return Math.floor((t / 1000) % 60); }

  

  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
      navbar.classList.add('nav-sticky');
    } else {
      navbar.classList.remove('nav-sticky');
    }
  }
  // toggleMenu() {
  //   document.getElementById('topnav-menu-content').classList.toggle('show');
  // }

 // MÉTHODES POUR GÉRER LE MENU MOBILE
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Alternative si Bootstrap JS ne fonctionne pas
    const navbarCollapse = document.getElementById('topnav-menu-content');
    if (navbarCollapse) {
      if (this.isMenuOpen) {
        navbarCollapse.classList.add('show');
      } else {
        navbarCollapse.classList.remove('show');
      }
    }
  }


  closeMenu(): void {
    this.isMenuOpen = false;
    
    // Fermer le menu mobile après clic sur un lien
    const navbarCollapse = document.getElementById('topnav-menu-content');
    if (navbarCollapse) {
      navbarCollapse.classList.remove('show');
    }
  }


  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  /**
   * Logout the user
   */
  logout() {
    this.localStorageService.logout();
    
    // je vide le profile du store
    this.storeService.dispatch(setUserProfile({user: null}));
    // je redirige vers la home page
    this.router.navigate(['/']);
  }


  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalRef = this.modalService.show(content);
  }

  saveAvis(){

    // console.log("xxxxx");
    // console.log(this.formData.value);

    
    this.submitted = true;
        
    if(this.formData.invalid){
      console.log("----------------------")
      return
    };
    
    if(this.localStorageService?.currentUserValue){
      let avis: AvisRequestDto =  {
        note: this.formData.value.note,
        description: this.formData.value.description,
        userId: this.localStorageService.currentUserValue.userCode
      };

      // dispacher l'action de create de grille tarifaire
      this.storeService.dispatch(createAvis({avis: avis}));

    }
    else{
      const id = this.counter.toString().padStart(3, '0');
      const timestamp = Date.now(); 
      const username = `user${id}_${timestamp}`;
      const email = `${username}@example.com`;
      


      // generer un numero auto
      const now = Date.now().toString(); // timestamp en ms
      const lastDigits = now.slice(-5); // on prend les 5 derniers chiffres du timestamp
      const randomDigits = Math.floor(1000 + Math.random() * 8999); // 4 chiffres aléatoires

      const userPhoneNumber = `6${lastDigits}${randomDigits}`.slice(0, 9);

      // definir ici l'objet user
      let user: UserRequestDto = {
      userFirstName: username,
      // userLastName: ,
      userEmail: email,
      userType: UserTypeEnum.CUSTOMER,
      userPhoneNumber: userPhoneNumber,
      country: CountryEnum.FRANCE,
      userPassword: "customer@12",
      image: "",
    }

    // dispatch d action de create du user
    this.storeService.dispatch(createUser({user: user}));
    }

    
  }


  clear(){
    this.formData.reset();
    this.submitted = false;
  }


  ouvrirModalFormule(formuleId: string, template: TemplateRef<any>) {
    this.formuleSelectionnee = this.formules.find(f => f.id === formuleId);
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg'
    });
  }

  fermerModal() {
    this.modalRef?.hide();
  }
}
