# Documentation des Filtres Workspace et Shop

## Modifications effectuées

### 1. ProductService

#### Ajout de filtres automatiques
- **getProducts()**: Ajoute automatiquement `workspace_id` pour les Workspace Admins
- **getBrands()**: Ajoute automatiquement `workspace_id` si disponible
- **getCategoriesTree()**: Ajoute automatiquement `workspace_id` si disponible  
- **getProductTypes()**: Ajoute automatiquement `workspace_id` si disponible

#### Console.log ajoutés
Toutes les méthodes importantes ont maintenant des console.log pour capturer :
- Les paramètres de requête envoyés
- Les réponses reçues du backend
- Les erreurs éventuelles
- Les informations de workspace_id et shop_id

### 2. ProductSearchParams
- Ajout de `workspace_id?: string`
- Ajout de `shop_id?: string`

### 3. Points à vérifier avec le backend

#### ⚠️ Incohérences potentielles identifiées :

1. **getBrands()**: Le backend doit accepter `workspace_id` en paramètre de requête
2. **getCategoriesTree()**: Le backend doit accepter `workspace_id` en paramètre de requête
3. **getProductTypes()**: Le backend doit accepter `workspace_id` en paramètre de requête
4. **Shop Managers**: Le token doit contenir `shop_id` pour filtrer automatiquement les produits par boutique

#### 🔍 À vérifier dans le token JWT :
- `workspaceId` ou `workspace_id` pour les Workspace Admins
- `shopId` ou `shop_id` pour les Shop Managers
- Le backend doit filtrer automatiquement selon ces valeurs

### 4. Console.log disponibles

Tous les appels API affichent maintenant dans la console :
- `[ProductService.METHOD_NAME]` pour identifier la méthode
- `✅ Response received` pour les succès
- `❌ Error` pour les erreurs
- `⚠️ No workspace_id available` pour les avertissements

### 5. Prochaines étapes

1. Tester avec un Workspace Admin et vérifier que seuls les produits de son workspace apparaissent
2. Tester avec un Shop Manager et vérifier que seuls les produits de sa boutique apparaissent
3. Vérifier les réponses backend dans la console du navigateur
4. Signaler les incohérences backend si les filtres ne fonctionnent pas

