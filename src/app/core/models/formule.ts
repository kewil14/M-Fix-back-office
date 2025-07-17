export interface Formule {
  id: string;
  nom: string;
  description: string;
  image: string;
  details: {
    prix: string;
    duree: string;
    services: string[];
    avantages: string[];
  };
}