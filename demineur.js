const zoneJeuElement = document.getElementById("conteneur-grille")
const niveauElement = document.getElementById("choix-niveau")
const boutonNouvellePartie = document.getElementById("btn-nouvelle-partie")
const msgElement = document.getElementById ("message")
const compteurMinesElement = document.getElementById('compteur-mines')
const compteurTempsElement = document.getElementById('compteur-temps')
let deja_vu = Array()
let compteur_en_marche = false
let t1 = 0
let t = 0


let coteA = 0		// hauteur
let coteB = 0		// largeur
let nbMines = 0
let nbFlag = 0
let grille = Array()

function lancerJeu(){
	deja_vu = Array()
	zoneJeuElement.innerHTML = ''
	msgElement.innerHTML = ''
	let niveau = niveauElement.value
	nbFlag = 0
	actualiserCompteurMines()
	compteurTempsElement.innerHTML = '000'
	compteur_en_marche = false
	genererGrille(niveau)
	afficherGrille()

}



function genererGrille(niveau){
	switch (niveau){
		case "1":
			coteA = 9
			coteB = 9
			nbMines = 10
			break
		case "2":
			coteA = 16
			coteB = 16
			nbMines = 40
			break
		case "3":
			coteA = 30
			coteB = 16
			nbMines = 99
			break
	}
	
	actualiserCompteurMines()
	grille = Array(coteA*coteB)
	grille.fill(0)
	
	// Placer les mines
	let minesPlacees = 0
	while (minesPlacees < nbMines){
		let i = Math.floor(Math.random()*grille.length)
		if (grille[i] === 0){
			grille[i] = -1
			minesPlacees += 1
		}
	}
	
	// Remplir la grille avec les indications
	for (let i = 0; i<grille.length; i++){
		if (grille[i] === -1){
			let voisins = listeVoisins(i)
			voisins.forEach (elt => grille[elt] !== -1? grille[elt] += 1: 1==1)
		}
	}
	
}



function ouvrirCase(i){
	const caseElement = document.getElementById(i)
	if (compteur_en_marche == false){
		compteur_en_marche = true
		t1 = Date.now()
		interval = setInterval(actualiserCompteurTemps, 1000)
	}
	if (caseElement.drapeau != 1){
		if (deja_vu.indexOf(i) === -1){deja_vu.push(i)}
		caseElement.ouvert = true
		if (grille[i] === 0){
			afficherCase(i)
			let voisins = listeVoisins(i)
			voisins.forEach(elt => ouvrirCase(elt))
			checkFinPartie()
		} else if (grille[i] === -1){
			afficherCase(i)
			finPartie(false)
		} else {
			afficherCase(i)
			checkFinPartie()
		}
	
	}
}


function listeVoisins (i){
	i = Number (i)
	let voisins = Array(i-coteA-1, i-coteA, i-coteA+1, i-1, i+1, i+coteA-1, i+coteA, i+coteA+1)
	voisins = voisins.filter( elt => elt >= 0 && elt < coteA*coteB && elt%coteA >= i%coteA-1 && elt%coteA <= i%coteA+1)
	voisins = voisins.filter( elt => deja_vu.indexOf(elt) === -1)
	return voisins
}


function afficherGrille(){
	const tableElement = document.createElement('table')
	zoneJeuElement.appendChild(tableElement)
	let parentElement = document.createElement('tr')
	
	for (let i = 0; i < grille.length; i++){
		if (i%coteA == 0){
			parentElement = document.createElement('tr')
			tableElement.appendChild(parentElement)
		}
		const cell = document.createElement('td')
		cell.id = i
		cell.innerHTML = "0"
		cell.drapeau = 0
		cell.ouvert = false
		cell.addEventListener('mouseOver', (event) => event.peventDefault())
		cell.addEventListener('click', handler)
		cell.addEventListener('contextmenu', handleRightClick)
		parentElement.appendChild(cell)
	}
	
}


function handleRightClick(event) {
	event.preventDefault()
	if (event.target.ouvert === true) {
		let voisinage = listeVoisins(event.target.id)
		let cases = Array.from(document.querySelectorAll('td')).filter(elt => voisinage.indexOf(Number(elt.id)) !== -1)
		let marques = cases.filter(elt => elt.drapeau == 1).length
		if (marques == grille[Number(event.target.id)]){
			voisinage.forEach(elt => ouvrirCase(elt))
		}
				
	} else {
		toggleDrapeau(Number(event.target.id))	
	}
}




function handler(){
	ouvrirCase(Number(event.target.id))
}

function afficherCase(i){
	const caseElement = document.getElementById(i)
	switch (grille[i]){
		case 0:
			caseElement.innerHTML = '0'
			caseElement.style.background = 'white'
			caseElement.style.color = 'white'
			break
		case -1:
			caseElement.innerHTML = 'x'
			caseElement.style.background = 'red'
			caseElement.style.color = 'black'
			break
		default: 
			caseElement.style.background = 'white'
			caseElement.innerHTML = grille[i]
			caseElement.style.color = 'black'
	}
	
}


function toggleDrapeau(i){
	const caseElement = document.getElementById(i)
	if (caseElement.ouvert === false){
		caseElement.drapeau = (caseElement.drapeau + 1)%3
		switch (caseElement.drapeau){
			case 0:
				caseElement.innerHTML = '0'
				caseElement.style.color = 'lightgrey'
				break
			case 1:
				caseElement.innerHTML = 'P'
				caseElement.style.color = 'black'
				nbFlag += 1
				actualiserCompteurMines()
				break
			case 2:
				caseElement.innerHTML = '?'
				caseElement.style.color = 'black'
				nbFlag -= 1
				actualiserCompteurMines()
				break
		}
	}
}


function checkFinPartie(){
	let listeCases = Array.from(document.querySelectorAll('td'))
	listeCases = listeCases.filter(elt => !elt.ouvert)
	if (listeCases.length === nbMines) {
		finPartie(true)		
	}
}


function finPartie(status){
	let msg = (status === true ? "Félicitations, vous avez gagné!" : "Boom! Try again")
	msgElement.innerHTML = msg
	clearInterval(interval)
	const listeCases = Array.from(document.querySelectorAll('td'))
	listeCases.forEach(function(elt){
		elt.removeEventListener('click', handler)
		elt.removeEventListener('contextmenu', handleRightClick)
		if (elt.drapeau != 1 && elt.ouvert == false && grille[elt.id] == -1){
			elt.innerHTML = 'x'
			elt.style.color = 'black'
		} else if (elt.drapeau == 1 && grille[elt.id] != -1) {
			elt.style.backgroundColor = 'red'
		}
	})
	
}


function actualiserCompteurMines(){
	compteurMinesElement.innerHTML = `${nbFlag}/${nbMines}`
}


function actualiserCompteurTemps(){
	t = Math.floor((Date.now() - t1)/1000)
	compteurTempsElement.innerHTML = String(t).padStart(3,'0')
}

boutonNouvellePartie.addEventListener('click', lancerJeu)
