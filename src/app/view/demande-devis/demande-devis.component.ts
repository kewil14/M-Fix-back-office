import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, Subscription } from 'rxjs';
import { DataStateEnum } from 'src/app/core/config/data.state.enum';
import { CountryEnum, UserTypeEnum } from 'src/app/core/config/list-roles';
import { selectAddressState, selectDemandeState, selectUserState } from 'src/app/core/core.state';
import { AddressDateDemandDto } from 'src/app/core/shared/dtos/address-date-demand-dto';
import { DemandeRequestDto } from 'src/app/core/shared/dtos/demande-request-dto.modal';
import { UserRequestDto } from 'src/app/core/shared/dtos/user-request-dto.modal';
import { UserResponseDto } from 'src/app/core/shared/dtos/user-response-dto.modal';
import { findAllAdress } from 'src/app/core/shared/stores/address/address.actions';
import { AddressState } from 'src/app/core/shared/stores/address/address.state';
import { addDemande, createDemande, erreurDemandes } from 'src/app/core/shared/stores/demande/demande.actions';
import { DemandeState } from 'src/app/core/shared/stores/demande/demande.state';
import { addUser, createUser, erreurUsers } from 'src/app/core/shared/stores/user/user.actions';
import { UserState } from 'src/app/core/shared/stores/user/user.state';

@Component({
  selector: 'app-demande-devis',
  templateUrl: './demande-devis.component.html',
  styleUrls: ['./demande-devis.component.scss']
})
export class DemandeDevisComponent implements OnInit {
  quoteRequestForm: FormGroup;
  adressRequestForm: FormGroup;
  currentStep: number = 1;
  showVolumeCalculator: boolean = false;
  selectedCategory: string = 'Chambre';

  demande: DemandeRequestDto;

  demandeState$: Observable<DemandeState>; 
  userState$: Observable<UserState>; 
  adressState$: Observable<AddressState>; 

  demandeStart$: Observable<AddressDateDemandDto>;

  subscriptions: Subscription[] = [];

  user!: UserResponseDto;
  
  formulas = [
    { value: 'simplicite', label: 'Simplicité' },
    { value: 'complicite', label: 'Complicité' },
    { value: 'tranquilite', label: 'Tranquilité' },
    { value: 'serenité', label: 'Sérénité' }
  ];
  
  formulaOptions = {
    simplicite: [
      'Protection des sommiers et matelas sous housses',
      'Conditionnement des écrans plats sous housses',
      'Protection du mobilier sous couvertures de laine',
      'Manutention et transport du mobilier en véhicules capitonnés',
      'Remise en place au nouveau domicile'
    ],
    complicite: [
      'Protection des sommiers et matelas sous housses',
      'Conditionnement des écrans plats sous housses',
      'Protection du mobilier sous couvertures de laine',
      'Manutention et transport du mobilier en véhicules capitonnés',
      'Remise en place au nouveau domicile',
      'Démontage et remontage du mobilier'
    ],
    tranquilite: [
      'Protection des sommiers et matelas sous housses',
      'Conditionnement des écrans plats sous housses',
      'Protection du mobilier sous couvertures de laine',
      'Manutention et transport du mobilier en véhicules capitonnés',
      'Remise en place au nouveau domicile',
      'Démontage et remontage du mobilier',
      'Transports des vêtements sur cintres dans des penderies portatives',
      'Emballage et déballage de la vaisselle et de tous les objets fragiles',
      'Conditionnement et emballage des lampes et des glaces'
    ],
    serenite: [
      'Protection des sommiers et matelas sous housses',
      'Conditionnement des écrans plats sous housses',
      'Protection du mobilier sous couvertures de laine',
      'Manutention et transport du mobilier en véhicules capitonnés',
      'Remise en place au nouveau domicile',
      'Démontage et remontage du mobilier',
      'Transports des vêtements sur cintres dans des penderies portatives',
      'Emballage et déballage de la vaisselle et de tous les objets fragiles',
      'Conditionnement et emballage des lampes et des glaces',
      'Emballage du matériel informatique, hi-fi et vidéo',
      'Emballage des objets non fragiles (linge, livres, batteries de cuisine)'
    ]
  };
  
  furnitureCategories: string[] = [
    'Autre mobilier',
    'Bureau',
    'Cabanon',
    'Chambre',
    'Cuisine',
    'Entrée',
    'Extérieur',
    'Garage',
    'Salle à manger',
    'Salle de bains'
  ];
  
  furnitureItems: FurnitureItem[] = [
    { id: 1, name: 'Lit simple', category: 'Chambre', volume: 1.0, image: 'assets/furniture/single-bed.svg' },
    { id: 2, name: 'Lit double', category: 'Chambre', volume: 1.5, image: 'assets/furniture/double-bed.svg' },
    { id: 3, name: 'Armoire', category: 'Chambre', volume: 2.0, image: 'assets/furniture/wardrobe.svg' },
    { id: 4, name: 'Table de chevet', category: 'Chambre', volume: 0.3, image: 'assets/furniture/nightstand.svg' },
    { id: 5, name: 'Commode', category: 'Chambre', volume: 1.0, image: 'assets/furniture/dresser.svg' },
    
    { id: 6, name: 'Table', category: 'Salle à manger', volume: 1.5, image: 'assets/furniture/dining-table.svg' },
    { id: 7, name: 'Chaise', category: 'Salle à manger', volume: 0.3, image: 'assets/furniture/chair.svg' },
    { id: 8, name: 'Buffet', category: 'Salle à manger', volume: 2.0, image: 'assets/furniture/sideboard.svg' },
    
    { id: 9, name: 'Réfrigérateur', category: 'Cuisine', volume: 1.2, image: 'assets/furniture/fridge.svg' },
    { id: 10, name: 'Four', category: 'Cuisine', volume: 0.5, image: 'assets/furniture/oven.svg' },
    { id: 11, name: 'Lave-vaisselle', category: 'Cuisine', volume: 0.6, image: 'assets/furniture/dishwasher.svg' },
    { id: 12, name: 'Micro-ondes', category: 'Cuisine', volume: 0.2, image: 'assets/furniture/microwave.svg' },
    
    // Ajouter d'autres éléments pour les autres catégories
  ];
  
  selectedItems: { [key: number]: number } = {};

  dataStateEnum: typeof DataStateEnum = DataStateEnum;
  

  constructor(
    private fb: FormBuilder,
    private storeService: Store,
    private actionService: Actions,
    private toastr:ToastrService,
    private router: Router,
  ) {
    this.quoteRequestForm = this.fb.group({
      // Step 1
      gender: ['Monsieur', Validators.required],
      lastname: ['', Validators.required],
      firstname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      
      startAddress: ['', Validators.required],
      startCity: ['', Validators.required],
      startZipCode: ['', Validators.required],
      startFloor: ['rdc', Validators.required],
      startElevator: ['Non', Validators.required],
      startDetails: [''],
      
      endAddress: ['', Validators.required],
      endCity: ['', Validators.required],
      endZipCode: ['', Validators.required],
      endFloor: ['rdc', Validators.required],
      endElevator: ['Non', Validators.required],
      endDetails: [''],
      
      // Step 2
      formula: ['simplicite', Validators.required],
      storageOption: [false],
      
      // Step 3
      volume: ['', Validators.required]
    });
  };


  

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.demandeState$ = this.storeService.select(selectDemandeState).pipe();
    this.userState$ = this.storeService.select(selectUserState).pipe();
    this.adressState$ = this.storeService.select(selectAddressState).pipe();

    // recuperation async de l'observable
    this.demandeStart$ = this.storeService.select(selectDemandeState).pipe(
      map((state: DemandeState) => state.demandeStart)
    );

    // subscripbe a l'obs demandeStart
    this.demandeStart$.subscribe(
      (demandeStart: AddressDateDemandDto) => {
        console.log('demandeStart récupéré:', demandeStart);
        // Utilisez demandeStart ici...
      }
    );

    this.actionDemande();

    this.initFormAdress();
    
  }


  onAddressInput(value: string): void {
    if (value && value.length > 2) {
      this.storeService.dispatch(findAllAdress({ q: value }));
    }
  }


  initFormAdress(): void{
    this.adressRequestForm = this.fb.group({       
      startAddress: ['', Validators.required],
      startCity: ['', Validators.required],
      startZipCode: ['', Validators.required],
      startFloor: ['rdc', Validators.required],
      startElevator: ['Non', Validators.required],
      startDetails: [''],
      
      endAddress: ['', Validators.required],
      endCity: ['', Validators.required],
      endZipCode: ['', Validators.required],
      endFloor: ['rdc', Validators.required],
      endElevator: ['Non', Validators.required],
      endDetails: [''],
    })
  }

  actionDemande(){
      this.subscriptions.push(
        this.actionService.pipe(ofType(addDemande)).subscribe((state) => {
          // vider le formulaire
          this.quoteRequestForm.reset();
          // remettre l'étape courante à 1
          this.currentStep = 1;
          // fermer le modal
          // this.modalService.hide();
          // afficher un message de succès
          this.toastr.success('Demande envoyée avec succès !');
          // rediriger vers la page de home
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 4000)
  
        }),


        this.actionService.pipe(ofType(addUser)).subscribe(({user}) => {
          this.user = user;
          // console.log('User créé avec succès:', user);


          // envoyer a l'étape 2
          this.currentStep = 2;
  
        }),


        this.actionService.pipe(ofType(erreurDemandes)).subscribe((state) => {

          // envoyer une popup d'erreur   


        }),


        this.actionService.pipe(ofType(erreurUsers)).subscribe(({messages}) => {

          this.currentStep = 1;

          this.toastr.error(messages);



        }),
          
    )
  }
  
  get formControls() {
    return this.quoteRequestForm.controls;
  }
  
  nextStep(): void {
    if (this.currentStep < 4) {
      // Valider le formulaire de l'étape actuelle avant de passer à la suivante
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    }
  }
  
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  validateCurrentStep(): boolean {
    let valid = false;
    
    switch (this.currentStep) {
      case 1:
        // Valider les champs de l'étape 1
        const step1Controls = [
          'gender', 'lastname', 'firstname', 'email', 'phone', 
          'fromDate', 'toDate', 'startAddress', 'startCity', 'startZipCode', 
          'startFloor', 'startElevator', 'endAddress', 'endCity', 'endZipCode', 
          'endFloor', 'endElevator'
        ];
        
        valid = step1Controls.every(controlName => 
          this.quoteRequestForm.get(controlName)?.valid
        );
        
        if (!valid) {
          // Marquer tous les champs comme touchés pour afficher les erreurs
          step1Controls.forEach(controlName => {
            const control = this.quoteRequestForm.get(controlName);
            if (control) {
              control.markAsTouched();
            }
          });
        };

        // definir ici l'objet user
        let user: UserRequestDto = {
          userFirstName: this.quoteRequestForm.value.firstname,
          userLastName: this.quoteRequestForm.value.lastname,
          userEmail: this.quoteRequestForm.value.email,
          userType: UserTypeEnum.CUSTOMER,
          userPhoneNumber: "+33" + this.quoteRequestForm.value.phone,
          country: CountryEnum.FRANCE,
          userPassword: "customer@12",
          image: "",
        }

        // dispatch d action de create du user
        this.storeService.dispatch(createUser({user: user}));
        


        break;

      case 2: 
        // si jamais je veux break sur les adresses
        break;
      
      case 3:
        // Validation de l'étape 2 - la formule est déjà pré-sélectionnée
        valid = !!this.quoteRequestForm.get('formula')?.value;

        // constituer l'objet de demande
        this.demande = 
        {
          adresseDepart: {
            rue: this.quoteRequestForm.value.startAddress,
            ville: this.quoteRequestForm.value.startAddress,
            codePostal: this.quoteRequestForm.value.startAddress,
          },
          adresseDestination: {
            rue: this.quoteRequestForm.value.endAddress,
            ville: this.quoteRequestForm.value.endAddress,
            codePostal: this.quoteRequestForm.value.endAddress,
          },
          
          dateDemande: this.quoteRequestForm.value.fromDate,
          dateDemenagement: this.quoteRequestForm.value.toDate,
          description: this.quoteRequestForm.value.startDetails,
          userCode: this.user.userCode,
        };

        // dispatch d action de create de la demande
        // this.storeService.dispatch(createDemande({demande: demande}));

        break;

      case 4:

        break;
        
      default:
        valid = true;
    }
    
    return valid;
  }
  
  onSubmit(): void {
    if (this.quoteRequestForm.valid) {
      console.log('Formulaire soumis avec succès!', this.quoteRequestForm.value);

      

      // {
      //   "idDemande": 0,
      //   "dateDemande": "2025-05-05T02:33:17.748Z",
      //   "dateDemenagement": "2025-05-05T02:33:17.748Z",
      //   "description": "string",
      //   "adresseDepart": {
      //     "rue": "string",
      //     "ville": "string",
      //     "codePostal": "string"
      //   },
      //   "adresseDestination": {
      //     "rue": "string",
      //     "ville": "string",
      //     "codePostal": "string"
      //   },
      //   "state": "ACTIVE",
      //   "userCode": "string"
      // }


      // Declencher l'action de create de demande
        this.storeService.dispatch(createDemande({demande: this.demande}));

    } else {
      console.log("----------invalid---------------")
      this.markAllFieldsAsTouched();
    }
  }
  
  markAllFieldsAsTouched(): void {
    Object.keys(this.quoteRequestForm.controls).forEach(field => {
      const control = this.quoteRequestForm.get(field);
      control?.markAsTouched();
    });
  }
  
  // Méthodes pour le calculateur de volume
  openVolumeCalculator(): void {
    this.showVolumeCalculator = true;
  }
  
  closeVolumeCalculator(): void {
    this.showVolumeCalculator = false;
  }
  
  selectCategory(category: string): void {
    this.selectedCategory = category;
  }
  
  getItemsByCategory(category: string): FurnitureItem[] {
    return this.furnitureItems.filter(item => item.category === category);
  }
  
  getItemQuantity(item: FurnitureItem): number {
    return this.selectedItems[item.id] || 0;
  }
  
  increaseItemQuantity(item: FurnitureItem): void {
    if (!this.selectedItems[item.id]) {
      this.selectedItems[item.id] = 0;
    }
    this.selectedItems[item.id]++;
  }
  
  decreaseItemQuantity(item: FurnitureItem): void {
    if (this.selectedItems[item.id] && this.selectedItems[item.id] > 0) {
      this.selectedItems[item.id]--;
    }
  }
  
  getTotalVolume(): number {
    let total = 0;
    for (const itemId in this.selectedItems) {
      if (this.selectedItems.hasOwnProperty(itemId)) {
        const item = this.furnitureItems.find(i => i.id === +itemId);
        if (item) {
          total += item.volume * this.selectedItems[itemId];
        }
      }
    }
    return parseFloat(total.toFixed(2));
  }
  
  resetCalculator(): void {
    this.selectedItems = {};
  }
  
  validateVolume(): void {
    const totalVolume = this.getTotalVolume();
    this.quoteRequestForm.patchValue({
      volume: totalVolume
    });
    this.closeVolumeCalculator();
  }
}

interface FurnitureItem {
  id: number;
  name: string;
  category: string;
  volume: number;
  image: string;
}
