# Ajouter un module

Pour ajouter un module au projet, suivez ces étapes :

1. **Naviguez vers le répertoire `src`** et copiez le dossier `Template`.
2. **Renommez le dossier** avec le nom du module et sa version, par exemple : `Giveaway V1`.
   
   La version d'un module détermine son niveau de complexité et de fonctionnalités avancées. Voici une vue d'ensemble des versions disponibles :
   
   | Version | Type         | Exemple       |
   | ------- | ------------ | ------------- |
   | 1       | Basique      | Giveaway V1   |
   | 2       | Avancé       | Giveaway V2   |
   | 3       | Professionnel| Giveaway V3   |

3. **Mise à jour du fichier `module.json` :**
   Le fichier `module.json` ne doit pas inclure la version dans son nom, mais plutôt dans la propriété `version`. Par exemple, pour un module nommé "Giveaway V1", le fichier `module.json` ressemblera à ceci :
   
   ```json
   {
       "name": "Giveaway",
       "version": "1.x.x"
   }
4. **Structure du module** : Le code source du module doit se trouver dans le répertoire `[nom]/build/base/` afin de respecter la syntaxe des modules.
5. **Tester le module** : Pour tester le module ajouté, exécutez les commandes suivantes :
```bash
npx tsc
node index.js
```
Cela permettra de compiler le code TypeScript et de démarrer le module.
