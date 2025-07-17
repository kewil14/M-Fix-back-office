import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mention-legale',
  templateUrl: './mention-legale.component.html',
  styleUrls: ['./mention-legale.component.scss']
})
export class MentionLegaleComponent implements OnInit {
  quoteRequestForm: FormGroup;
  currentStep: number = 1;
  showVolumeCalculator: boolean = false;
  selectedCategory: string = 'Chambre';

  captchaValid: boolean = false;

  contactForm: FormGroup;


  
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

  constructor(private fb: FormBuilder) {
    
  }

  ngOnInit(): void {
    this.initForm();
    
  }

  initForm(): void{
    this.contactForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }
  
  get formControls() {
    return this.quoteRequestForm.controls;
  }
  
  nextStep(): void {
    if (this.currentStep < 3) {
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
        }
        break;
        
      case 2:
        // Validation de l'étape 2 - la formule est déjà pré-sélectionnée
        valid = !!this.quoteRequestForm.get('formula')?.value;
        break;
        
      default:
        valid = true;
    }
    
    return valid;
  }
  
  submitForm() {
    if (!this.captchaValid) {
      alert("Veuillez valider le reCAPTCHA !");
      return;
    }
    console.log("Formulaire soumis :", this.contactForm.value);
    alert("Votre message a bien été envoyé !");
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
