## Présentation des tests effectués pour vérifier le bon fonctionnement du contrat `Casino.sol`

### 1. Déploiement

- **Should set the right owner** : Vérifier que l'owner est bien l'adresse de déploiement.
- **Should not set another owner** : Vérifier qu'une autre adresse n'est pas définie comme propriétaire.
- **Should have initial token supply minted** : Vérifier que l'offre initiale de jetons est bien de 1,000,000.
- **Should have initial token balance** : Vérifier que le contrat a le bon solde initial de jetons.
- **Should have TOKEN_PRICE set correctly** : Vérifier que le prix du jeton est bien initialisé.
- **Player totalGains should be 0 at deployment** : Vérifier que les gains totaux des joueurs sont initialisés à 0.
- **Player biggestWin should be 0 at deployment** : Vérifier que le plus gros gain des joueurs est initialisé à 0.
- **Player nbGames should be 0 at deployment** : Vérifier que le nombre de jeux des joueurs est initialisé à 0.
- **Player nbGamesWins should be 0 at deployment** : Vérifier que le nombre de victoires des joueurs est initialisé à 0.
- **Should have biggestSingleWinEver set to 0** : Vérifier que le plus gros gain unique jamais réalisé est initialisé à 0.
- **Should have biggestTotalWinEver set to 0** : Vérifier que le plus gros gain total jamais réalisé est initialisé à 0.

### 2. Achat de jetons

- **Should allow buying tokens with sufficient ETH** : Vérifier que les jetons peuvent être achetés avec suffisamment d'ETH.
- **Should revert if the amount is less than the price of 10 tokens** : Vérifier que l'achat est refusé si le montant est inférieur au prix de 10 jetons.
- **Should revert if less than 10 tokens are bought** : Vérifier que l'achat est refusé si moins de 10 jetons sont achetés.
- **Should revert if ETH sent are not enough for this quantity of tokens** : Vérifier que l'achat est refusé si l'ETH envoyé est insuffisant.
- **Should revert if not enough tokens are available for purchase** : Vérifier que l'achat est refusé s'il n'y a pas assez de jetons disponibles.
- **Should revert if the supply after the purchase is greater than 5%** : Vérifier que l'achat est refusé si l'utilisateur possède plus de 5% de l'offre totale après l'achat.

### 3. Retour de jetons

- **Should return tokens if allowance is sufficient** : Vérifier que les jetons sont retournés si l'autorisation est suffisante.
- **Should revert if returning more tokens than owned** : Vérifier que le retour est refusé si plus de jetons que possédés sont retournés.
- **Should revert if returning zero tokens** : Vérifier que le retour est refusé si zéro jeton est retourné.
- **Should revert if allowance is not set** : Vérifier que le retour est refusé si l'autorisation n'est pas définie.
- **Should revert if allowance is less than the number of tokens to be returned** : Vérifier que le retour est refusé si l'autorisation est inférieure au nombre de jetons retournés.
- **Should emit PlayerBecameInactive if player returns all tokens** : Vérifier que l'événement PlayerBecameInactive est émis si le joueur retourne tous ses jetons.

### 4. Jeux

- **Should revert if allowance is not set** : Vérifier que l'authorisation de dépenser les tokens du joueur a été donné au smart contrat.
- **Should revert if allowance is less than the bet amount** : Vérifier que l'authorisation de dépenser les tokens du joueur est suffisante.
- **Should play game if allowance is sufficient** : Vérifier que le joueur peut jouer après qu'il ait donné l'authorisation de dépenser ses tokens.
- **Should play game type 1 and lose tokens** : Vérifier que les jetons sont perdus lorsqu'un jeu de type 1 est perdant.
- **Should play game type 1 and check the event for loss** : Vérifier que l'événement de perte est émis lorsqu'un jeu de type 1 est perdant.
- **Should play game type 1 multiple times and check the event for win** : Vérifier que l'événement de gain est émis lorsque un jeu de type 1 est gagnant.
- **Should play game type 2 and lose tokens** : Vérifier que les jetons sont perdus lorsqu'un jeu de type 2 est perdant.
- **Should play game type 2 and check the event for loss** : Vérifier que l'événement de perte est émis lorsqu'un jeu de type 2 est perdant.
- **Should play game type 2 multiple times and check the event for win** : Vérifier que l'événement de gain est émis lorsque un jeu de type 2 est gagnant.
- **Should revert if bet amount is zero** : Vérifier que le pari est refusé si le montant du pari est zéro.
- **Should revert if bet amount is more than player's balance** : Vérifier que le pari est refusé si le montant du pari est supérieur au solde du joueur.
- **Should revert if game type is invalid** : Vérifier que le jeu est refusé si le type de jeu est invalide (type 1 ou type 2 uniquement).
- **Should revert if bet amount for game type 2 is not a multiple of 3** : Vérifier que le pari est refusé si le montant du pari pour le type de jeu 2 n'est pas un multiple de 3.
- **Should emit PlayerPlayedGame when player plays a game** : Vérifier que l'événement PlayerPlayedGame est émis lorsqu'un joueur joue à un jeu.
- **Should update the number of games played when player plays a game** : Vérifier que le nombre de jeux joués est mis à jour lorsqu'un joueur joue à un jeu.
- **Should update player variables and global variables on win** : Vérifier que les variables du joueur et les variables globales sont mises à jour lors d'une victoire.
- **Should update biggestTotalWinEver when a new player surpasses previous totalGains** : Vérifier que biggestTotalWinEver est mis à jour lorsqu'un nouveau joueur dépasse les gains totaux précédents.
- **Should update player1 and global variables after multiple wins** : Vérifier que les variables du joueur1 et les variables globales sont mises à jour après plusieurs victoires.

### 5. Vérification de la solvabilité

- **Should revert if contract cannot pay potential win in tokens** : Vérifier que le jeu est refusé si le contrat ne peut pas payer le gain potentiel en jetons.
- **Should revert if contract cannot pay potential win in Ether** : Vérifier que le jeu est refusé si le contrat ne peut pas payer le gain potentiel en Ether.

### 6. Retrait d'ETH

- **Should allow owner to withdraw ETH** : Vérifier que l'owner peut retirer des ETH.
- **Should revert when non authorized user tries to withdraw ETH** : Vérifier que le retrait est refusé pour les utilisateurs non autorisés.
- **Should revert if not enough ETH in reserve** : Vérifier que le retrait est refusé s'il n'y a pas assez d'ETH en réserve.

### 7. Fonction de réception

- **Should revert when Ether is sent directly to the contract** : Vérifier que l'envoi direct d'Ether au contrat est refusé.

### 8. Fonction de mint

- **Should revert when a non authorized user tries to mint** : Vérifier que l'émission de nouveaux jetons est refusée pour les utilisateurs non autorisés.

## Résultats des tests

- **48 passing**


File              |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------|----------|----------|----------|----------|----------------|
 contracts/       |    97.92 |    86.36 |       90 |    96.55 |                |
  Casino.sol      |    97.87 |    85.94 |     87.5 |    96.49 |        215     |
  CasinoToken.sol |      100 |      100 |      100 |      100 |                |
------------------|----------|----------|----------|----------|----------------|
All files         |    97.92 |    86.36 |       90 |    96.55 |                |
------------------|----------|----------|----------|----------|----------------|

- ***Précision sur la ligne non couverte***

Ligne 215 : Bien que la fonction `fallback` du contrat Casino émette correctement un revert comme prévu, le message de revert ne peut pas être capturé avec précision lors des tests unitaires.  
Cela semble dû à des limitations dans la manière dont les transactions échouées sont gérées et rapportées dans l'environnement de test.  
En conséquence, même si le comportement attendu est bien observé (la transaction échoue), le message de revert exact n'est pas identifiable directement dans les résultats des tests.  
Une surveillance des mises à jour des outils de test sera régulièrement effectuée pour améliorer la couverture de ce cas.  
  
![FallbackUnknowRevert](https://github.com/sgnsgn/AlyraProjetFinal/assets/36860750/d9bff970-5460-4381-840c-d27fb5940439)
  
## Screenshot  
  
![UnitTestsResults](https://github.com/sgnsgn/AlyraProjetFinal/assets/36860750/e4a8f1e7-08c0-41a5-b490-b20847a7364f)





