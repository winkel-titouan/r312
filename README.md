# TD et TP 1 - Application d'Agence Immobilière avec Astro et PocketBase

## Objectifs pédagogiques

L'objectif de cette semaine est un rappel de ce qu'on a vu l'année passée dans la ressource R213. De plus nous verrons comment utiliser les types avec TypeScript pour éviter les erreurs en runtime.

### Étape 1 : Installation et configuration

1. **Initialiser le projet Astro**
   ```bash
   npm create astro@latest r312-td
   cd r312-td
   ```

2. **Installer les dépendances**
   ```bash
   npm install pocketbase
   ```

### Étape 2 : Configuration de la base de données si vous ne trouver pas celle faite en S2

1. **Créer la collection `maison`** avec les champs suivants :
   - `nomMaison` (text) - Nom de la propriété
   - `adresse` (text) - Adresse complète
   - `prix` (number) - Prix en euros
   - `surface` (number) - Surface en m²
   - `nbChambres` (number) - Nombre de chambres
   - `nbSdb` (number) - Nombre de salles de bain
   - `image` (file) - Photo de la propriété
   - `favori` (bool) - Marquer comme favori

2. **Générer les types TypeScript**
   ```bash
   npx pocketbase-typegen --url https://votre-instance.pockethost.io/ --email votre-email --password votre-mot-de-passe --out src/utils/pocketbase-types.ts
   ```

### Étape 3 : Configuration de la connexion

Créer le fichier `src/utils/db.ts` :
```typescript
import PocketBase from 'pocketbase';
import type { TypedPocketBase } from "./pocketbase-types";

const pb = new PocketBase('URL') as TypedPocketBase;
export default pb;
```
En utilisant `TypedPocketBase`, nous tirons parti des types générés automatiquement via `pocketbase-typegen`. Cela nous offre l'autocomplétion et un typage strict pour toutes les collections et tous les champs définis dans la base de donnée. L'avantage principal est une réduction significative des erreurs lors de l'accès aux données, un problème fréquemment rencontré en S2.


##  Développement de l'application

### Partie A : Page d'accueil (index.astro)

**Objectif** : Afficher la liste des maisons disponibles dans la page

1. **Récupération des données**
   - Importer PocketBase depuis `../utils/pb`
   - Utiliser `pb.collection(Collection.Maison).getFullList()` pour récupérer toutes les maisons
   - Trier par date de création décroissante

```typescript
---
// le frontmatter de index.astro
import { Collections } from '../../pocketbase-types';
import Card from '../components/Card.astro';
import Layout from '../layouts/Layout.astro';
import pb  from '../utils/pb';

let listMaisons = await pb.collection(Collections.Maison).getFullList({
	sort: '-created',
});
console.log(listMaisons);
---
```

- Assurez-vous que la liste des offres est affichée dans la console.

2. **Affichage des données**
   - Créer un composant `Card.astro` pour afficher chaque maison
   - Utiliser la méthode `map()` pour parcourir la liste

```html
	<a href="/add" ><button>Ajouter une Offre</button></a>
	{???.map((???) => (
		<Card maison={maison} />
	))}
```


### Partie B : Composant Card (CardOffre.astro)

**Objectif** : Créer un composant réutilisable pour afficher une maison

1. **Props et types**
   - Définir l'interface `Props` avec `maison: MaisonRecord`
   - Importer le type `MaisonRecord` depuis les types générés
  

```typescript
---
// frontmatter de CardOffre.astro
// Import du type MaisonRecord généré automatiquement depuis PocketBase
// Ce type contient tous les champs de la collection 'maison' avec leurs types corrects
import type { MaisonRecord } from '../utils/pocketbase-types';
// Définition de l'interface Props pour typer les propriétés passées au composant
// Cela permet l'autocomplétion et la vérification de type au moment de la compilation
interface Props {
    maison: MaisonRecord; // La propriété maison doit être de type MaisonRecord
} 
// Extraction de la propriété maison depuis les props du composant Astro
const { maison } = Astro.props;
---
```

- Afficher les informations d'une maison:

```html
<div>
    <h2>{maison.nomMaison}</h2>
    <p>{maison.adresse}</p>
    ...
</div>
```

### Partie C : Composant d'image PocketBase (PbImage.astro)

**Objectif** : Afficher les images stockées dans PocketBase dans un composant réutilisable.

1. **Créer le composant `PbImage.astro`**
    - Ce composant reçoit comme propriétés les paramètres utilisés par la fonction `pb.files.getURL()`
    - Il génère l'URL complète de l'image stockée dans PocketBase
    - Utilise ensuite le composant `Image` d'Astro pour l'afficher de manière optimisée

2. **Props du composant**
    - `record` : L'enregistrement de la base de données contenant l'image
    - `imageField` : Le nom du champ qui contient le fichier image

```typescript
---
// Import de PocketBase pour accéder aux méthodes de gestion des fichiers
import pb from '../utils/pb';
// Import du composant Image d'Astro pour l'optimisation automatique des images
import { Image } from "astro:assets";

interface Props {
    record: { [key: string]: any }; // L'enregistrement PocketBase contenant l'image
    imageField: string; // Le nom de champ de la collection qui contient l'image
} 

// Récupération des propriétés passées au composant
const { record, imageField } = Astro.props;

// Génération de l'URL complète de l'image en utilisant PocketBase
// pb.files.getURL() prend l'enregistrement et le nom du fichier pour créer l'URL
const imageURL = pb.files.getURL(record, record[imageField]);
---

<!-- Affichage de l'image avec le composant Image d'Astro -->
<!-- inferSize={true} permet à Astro de détecter automatiquement les dimensions -->
{imageURL && 
    <Image
        src={imageURL}
        alt={record.nomMaison || 'Image'}
        inferSize={true}
    />
}
```

3. **Utilisation dans Card.astro**
```html
<!-- Remplacer <img> par le composant PbImage -->
<PbImage record={maison} imageField="image" />
```

### Si vous avez du temps : Ajouter un formulaire d'ajout

Si le temps le permet, implémentez un formulaire pour ajouter une nouvelle maison à la base de données. Vous pouvez vous inspirer du cours R213 ou consulter la documentation officielle d'Astro sur les formulaires : [Astro Forms Recipe](https://docs.astro.build/en/recipes/build-forms/).

**Instructions importantes :**
- Désactivez le prerendering sur la page d'ajout (voir [On-Demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)).
- Utilisez l'attribut `enctype="multipart/form-data"` dans la balise `<form>` pour permettre l'upload de fichiers (images).
- Effectuez toujours la validation des données côté serveur pour garantir la sécurité et l'intégrité des données.



# TP et TD 2: Utilisation d'une librairie de composants: DaisyUI

## Objectifs pédagogiques

L'objectif de cette semaine est d'ajouter du style en utilisant  [DaisyUI](https://daisyui.com/). DaisyUI est une librairie de composants basée sur Tailwind CSS qui permet de styliser rapidement des applications web avec des composants préconçus et personnalisables.

## Installation et Configuration:

1. **Installer les libraires de Tailwind CSS et daisyUI**:
    ```bash
    npx astro add tailwind
    npm install daisyui@latest
    ```

2. **Verifier que le fichier astro.config.mjs contient** :
    ```js
    // @ts-check
    import { defineConfig } from "astro/config";
    import tailwindcss from "@tailwindcss/vite";

    export default defineConfig({
        vite: {
            plugins: [tailwindcss()],
        },
    });
    ```

3. **Ajouter Tailwind CSS et daisyUI dans votre fichier CSS principal (et supprimer les autres styles)** :
    ```js
    @import "tailwindcss";
    @plugin "daisyui";
    ```


4. **Utiliser les classes DaisyUI dans vos composants** :
    - Par exemple :
      ```html
      <button class="btn btn-primary">Bouton DaisyUI</button>
      ```

Votre projet Astro est maintenant prêt à utiliser DaisyUI pour styliser vos composants rapidement.

Faites un commit.

## Exploration de l'utilisation des couleurs sémantiques

DaisyUI propose des couleurs sémantiques (comme `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`) qui facilitent la cohérence du design dans votre application.

### Exercice

1. **Modifiez la couleur des textes** de vos boutons, cartes et autres éléments en utilisant les classes de couleurs DaisyUI, par exemple :
    ```html
    <button class="btn btn-primary text-primary-content">Ajouter une Offre</button>
    <div class="card bg-base-100 shadow-xl border border-primary text-primary">
      <!-- contenu de la carte -->
    </div>
    ```

2. **Essayez différentes variantes** :
    - Remplacez `text-primary` par `text-secondary`, `text-accent`, `text-success`, etc.
    - Utilisez aussi les classes `text-base-content`, `text-info`, `text-warning`, etc. pour tester les couleurs sémantiques sur différents éléments.

3. **Ajoutez des messages d'état** avec des couleurs de texte adaptées, par exemple :
    ```html
    <div class="alert alert-success text-success-content">Opération réussie !</div>
    <div class="alert alert-error text-error-content">Une erreur est survenue.</div>
    ```

### Ressources utiles

- [Documentation DaisyUI - Colors](https://daisyui.com/docs/colors/)

Testez différentes couleurs et composants pour mieux comprendre l'intérêt des couleurs sémantiques dans la conception d'interfaces accessibles et cohérentes.
## Exploration des composants DaisyUI

DaisyUI propose de nombreux composants prêts à l'emploi (boutons, cartes, alertes, formulaires, modals, etc.) que vous pouvez intégrer facilement dans votre application Astro.

### Exercice

1. **Parcourez la [documentation DaisyUI - Components](https://daisyui.com/components/)** pour découvrir les différents composants disponibles.

2. **Remplacez vos éléments HTML classiques** (boutons, cartes, formulaires, etc.) par les composants DaisyUI correspondants. Par exemple :
    ```html
    <div class="card bg-base-100 w-96 shadow-sm m-5">
    <figure>
        <PbImage record={maison} imageField="image" />
    </figure>
    <div class="card-body">
        <h2 class="card-title">{maison.nomMaison}</h2>
        <p>{maison.adresse}</p>
        <div class="card-actions justify-end">
            <button class="btn btn-primary">Plus d'infos</button>
        </div>
    </div>
    ```

3. **Testez d'autres composants** comme les alertes, badges, modals, ou encore les barres de navigation pour enrichir l'interface de votre application.

4. **Personnalisez les composants** en utilisant les classes utilitaires Tailwind CSS et les options de DaisyUI pour adapter le style à vos besoins.

### Conseils

- Utilisez la documentation officielle pour copier-coller rapidement des exemples de composants.
- Pensez à la cohérence visuelle de votre application en utilisant les couleurs et variantes sémantiques vues précédemment.
- N'hésitez pas à explorer les options de personnalisation de DaisyUI pour adapter les composants à votre charte graphique.

## Utilisation des thèmes avec DaisyUI

DaisyUI propose plusieurs thèmes prédéfinis qui permettent de changer rapidement l'apparence globale de votre application (couleurs, ambiance claire/sombre, etc.). Vous pouvez aussi créer vos propres thèmes personnalisés.

### Activer et changer de thème

1. **Activer le sélecteur de thème DaisyUI**  
    Ajoutez l'attribut `data-theme` sur la balise `<html>` ou `<body>` de votre projet Astro pour appliquer un thème (Consultez la [liste complète des thèmes DaisyUI](https://daisyui.com/docs/themes/) pour voir les options disponibles (`light`, `dark`, `cupcake`, `bumblebee`, `emerald`, etc.)):
    ```html
    <html data-theme="light">
    <!-- ou -->
    <html data-theme="dark">
    <!-- ou un autre thème DaisyUI, par exemple -->
    <html data-theme="cupcake">
    ```

Par default,les themes `light` et `dark` sont activés. On peut activer d'autre themes dans le fichier css global:

```js
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, cupcake;
}
```

### Exemple de changement de theme dynamique

```html
<div class="p-4">
  <button onclick="document.documentElement.setAttribute('data-theme', 'dark')" class="btn btn-neutral">Mode sombre</button>
  <button onclick="document.documentElement.setAttribute('data-theme', 'light')" class="btn btn-primary ml-2">Mode clair</button>
</div>
```

Vous pouvez aussi utiliser les composants de type [Theme Controller](https://daisyui.com/components/theme-controller/) de DaisyUI.


### Personnaliser un thème

Vous pouvez personnaliser un thème dans le fichier CSS global. Par exemple pour changer la couleur primaire du thème `light`, il faut ajouter sous la ligne `@plugin "daisyui";`:
```js
@plugin "daisyui/theme" {
  name: "light";
  default: true;
  --color-primary: blue;
  --color-secondary: teal;
}
```
Vous pouvez aussi créer votre propre thème. DaisyUI propose un [générateur de thème](https://daisyui.com/theme-generator) pour concevoir facilement votre thème, puis copier le code généré dans votre fichier CSS.

Pour aller plus loin, consultez la [documentation DaisyUI sur les thèmes](https://daisyui.com/docs/themes/).


# Exercices
## Exercices pratiques

Pour mettre en application ce que vous avez appris, réalisez les exercices suivants :

1. **Créer votre propre thème DaisyUI**
    - Utilisez le [générateur de thème DaisyUI](https://daisyui.com/theme-generator) pour concevoir un thème personnalisé (choisissez vos couleurs, polices, etc.).
    - Ajoutez ce thème à votre projet en suivant la documentation DaisyUI sur les thèmes.
    - Appliquez votre thème à votre site d’agence immobilière.

2. **Styliser votre site avec DaisyUI**
    - Remplacez les éléments HTML classiques par des composants DaisyUI.
    - Essayez d’utiliser au moins un composant de chaque catégorie :
      - **Actions** (ex : boutons, dropdowns)
      - **Navigation** (ex : navbar, tabs)
      - **Data Display** (ex : cards, badges, alerts)
    - Consultez la [documentation des composants DaisyUI](https://daisyui.com/components/) pour trouver des exemples.

3. **Ajouter un bouton de changement de thème (Theme Controller)**
    - Ajoutez un bouton qui permet à l’utilisateur de basculer entre deux thèmes : un thème clair et un thème sombre.
    - Vous pouvez utiliser le composant [Theme Controller](https://daisyui.com/components/theme-controller/) de DaisyUI ou créer votre propre bouton avec du JavaScript.

4. **Créer une route dynamique pour les détails d’une maison**
    - Ajoutez une page dynamique qui affiche les détails d’une maison sélectionnée (par exemple : `/maison/[id].astro`).
    - Inspirez-vous de ce que vous avez vu en R213 pour la création de routes dynamiques dans Astro.
    - Affichez toutes les informations de la maison, y compris l’image, en utilisant les composants DaisyUI pour la mise en forme.


