
function ddiv(){return document.createElement("div")}
function removeNode(elt){elt.parentElement.parentElement.removeChild(elt.parentElement)}

document.querySelector("#rechercheAutocomplete").style.top = document.querySelector("header").offsetHeight +"px"
document.querySelector("#rechercheAutocomplete").style.width = document.querySelector(".containerSearchNav").offsetWidth +"px"

var jsonAutoComp = []
var villeSelectionne = {}

function displayAutoComplete(b=true){
    document.querySelector("#rechercheAutocomplete").style.display = (b?"block":"none")
}

function selectionVille(e){
    let elt = e.target
    while(!elt.getAttribute("villi")){elt = elt.parentElement}

    
    villeSelectionne = jsonAutoComp[elt.getAttribute("villi")]
    if(['75056', '13055', '69123'].includes(villeSelectionne.code)){
        gererArrondissement(villeSelectionne.code)
    }
    else{
        document.querySelector("#barreDeRecherche").value = villeSelectionne.code
        displayAutoComplete(false)
        rechercheCP("insee/"+villeSelectionne.code, true)
    }
}

function gererArrondissement(code_insee){
    var arrondissements = {
        "75056":[
            {"code":"75101","nom":"Paris - 1er Arrondissement"},
            {"code":"75102","nom":"Paris - 2ème Arrondissement"},
            {"code":"75103","nom":"Paris - 3ème Arrondissement"},
            {"code":"75104","nom":"Paris - 4ème Arrondissement"},
            {"code":"75105","nom":"Paris - 5ème Arrondissement"},
            {"code":"75106","nom":"Paris - 6ème Arrondissement"},
            {"code":"75107","nom":"Paris - 7ème Arrondissement"},
            {"code":"75108","nom":"Paris - 8ème Arrondissement"},
            {"code":"75109","nom":"Paris - 9ème Arrondissement"},
            {"code":"75110","nom":"Paris - 10ème Arrondissement"},
            {"code":"75111","nom":"Paris - 11er Arrondissement"},
            {"code":"75112","nom":"Paris - 12ème Arrondissement"},
            {"code":"75113","nom":"Paris - 13ème Arrondissement"},
            {"code":"75114","nom":"Paris - 14ème Arrondissement"},
            {"code":"75115","nom":"Paris - 15ème Arrondissement"},
            {"code":"75116","nom":"Paris - 16ème Arrondissement"},
            {"code":"75117","nom":"Paris - 17ème Arrondissement"},
            {"code":"75118","nom":"Paris - 18ème Arrondissement"},
            {"code":"75119","nom":"Paris - 19ème Arrondissement"},
            {"code":"75120","nom":"Paris - 20ème Arrondissement"},
        ],
        "13055":[
            {"code":"13201","nom":"Marseille - 1er Arrondissement"},
            {"code":"13202","nom":"Marseille - 2ème Arrondissement"},
            {"code":"13203","nom":"Marseille - 3ème Arrondissement"},
            {"code":"13204","nom":"Marseille - 4ème Arrondissement"},
            {"code":"13205","nom":"Marseille - 5ème Arrondissement"},
            {"code":"13206","nom":"Marseille - 6ème Arrondissement"},
            {"code":"13207","nom":"Marseille - 7ème Arrondissement"},
            {"code":"13208","nom":"Marseille - 8ème Arrondissement"},
            {"code":"13209","nom":"Marseille - 9ème Arrondissement"},
            {"code":"13210","nom":"Marseille - 10ème Arrondissement"},
            {"code":"13211","nom":"Marseille - 11er Arrondissement"},
            {"code":"13212","nom":"Marseille - 12ème Arrondissement"},
            {"code":"13213","nom":"Marseille - 13ème Arrondissement"}
        ],
        "69123":[
            {"code":"69381","nom":"Lyon - 1er Arrondissement"},
            {"code":"69382","nom":"Lyon - 2ème Arrondissement"},
            {"code":"69383","nom":"Lyon - 3ème Arrondissement"},
            {"code":"69384","nom":"Lyon - 4ème Arrondissement"},
            {"code":"69385","nom":"Lyon - 5ème Arrondissement"},
            {"code":"69386","nom":"Lyon - 6ème Arrondissement"},
            {"code":"69387","nom":"Lyon - 7ème Arrondissement"},
            {"code":"69388","nom":"Lyon - 8ème Arrondissement"},
            {"code":"69389","nom":"Lyon - 9ème Arrondissement"}
        ]
    }
    var infoge = {
        '75056':{"codedep":"75","nomdep":"Seine"},
        '13055':{"codedep":"13","nomdep":"Bouches-du-Rhône"},
        '69123':{"codedep":"69","nomdep":"Rhône"}
    }
    if(['75056', '13055', '69123'].includes(code_insee)){
        displayAutoComplete(false)
        let panneau = ddiv()
        panneau.className = "panel-body"
        jsonAutoComp = arrondissements[code_insee]
        for(a in arrondissements[code_insee]){
            panneau.appendChild(
                construireTuileVille(
                    a, 
                    arrondissements[code_insee][a].nom,
                    infoge[code_insee].codedep,
                    infoge[code_insee].nomdep,
                    arrondissements[code_insee][a].code
                    )
                )
        }
        document.querySelector("#rechercheAutocomplete").textContent = ""
        document.querySelector("#rechercheAutocomplete").appendChild(panneau)
        displayAutoComplete(true)
    }
    else{throw "gererArrondissement(), parametre erroné"}

    
}

function construireTuileVille(idd,nom_ville, code_dep, nom_dep, code_insee){
    let tuile = ddiv()
    tuile.className = "tile"
    let contenu = ddiv()
    contenu.className = "tile-content c-hand"
    let titre = ddiv()
    titre.className = "tile-title"
    let petit = document.createElement("small")
    petit.className = "tile-subtitle text-gray"
    titre.textContent = nom_ville
    petit.textContent = String(code_dep) + " - "+ nom_dep
    contenu.setAttribute("INSEE",code_insee)
    // console.log(ville)
    contenu.setAttribute("villi",idd )
    contenu.addEventListener("click",(e)=>selectionVille(e))
    contenu.appendChild(titre)
    contenu.appendChild(petit)
    tuile.appendChild(contenu)
    return tuile
}

document.querySelector("#barreDeRecherche").addEventListener("input",function(e){
    let elt_valeur = document.querySelector("#barreDeRecherche") 
    let valeur = elt_valeur.value
    if(valeur.length>0){
        setTimeout(()=>{
            if(valeur == document.querySelector("#barreDeRecherche").value){
                fetch("https://geo.api.gouv.fr/communes?nom="+valeur+"&fields=departement&boost=population&limit=5").then((response)=>{
                    if(response.ok) {
                        return response.json()
                    } else {
                        throw 'Mauvaise réponse du réseau; mettre une notification spectre';
                    }
                }).then((response)=>{
                    jsonAutoComp = response
                    let panneau = ddiv()
                    panneau.className = "panel-body"
                    // console.log(response)
                    for(ville in response){
                        panneau.appendChild(construireTuileVille(ville,response[ville].nom,response[ville].departement.code,response[ville].departement.nom,response[ville].code))
                    }
                    if(response.length==0){
                        panneau.textContent = `Pas de résultat pour la requète : "${valeur}"`
                        panneau.className += " panneauVide"
                    }
                    document.querySelector("#rechercheAutocomplete").textContent = ""
                    document.querySelector("#rechercheAutocomplete").appendChild(panneau)
                    displayAutoComplete(true)
                })
                    .catch((error)=> {
                    console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                    console.log("mettre une notification spectre")
                });
            }
        }, 300);
    }
})

function generateInfo(titre="Information",message="Une erreur est survenue",sorte="primary", tempus=3000){
    if(['','success','primary','warning','error'].includes(sorte)){
         let dd = ddiv()
         let uuid = crypto.randomUUID();
         dd.className = (sorte!=''?`toast toast-${sorte} mx-2`:"toast bg-dark mx-2")
         dd.innerHTML = `<button id="info_${uuid}" class="btn btn-clear float-right"></button>
            <h6>${titre}</h6>
            <div class="divider"></div>
            <p>${message}</p>`
        document.querySelector("#containerInfo").appendChild(dd)
        document.querySelector("#info_"+uuid).addEventListener('click',(e)=>{
            removeNode(e.target)
            // e.target.parentElement.parentElement.removeChild(e.target.parentElement)
        })
        setTimeout(() => {
            removeNode(document.querySelector("#info_"+uuid))
          }, tempus)
          

    }
    else throw "GenerateInfo qui merde"
}



// <div class="empty">
//   <div class="empty-icon">
//     <i class="icon icon-people"></i>
//   </div>
//   <p class="empty-title h5">You have no new messages</p>
//   <p class="empty-subtitle">Click the button to start a conversation.</p>
//   <div class="empty-action">
//     <button class="btn btn-primary">Send a message</button>
//   </div>
// </div>

// <div class="panel">
//     <div class="panel-header">
//         <div class="panel-title h6">Comments</div>
//     </div>
//     <div class="panel-body">
//         <div class="tile">
//             <div class="tile-icon">
//                 <figure class="avatar"><img src="../img/avatar-1.png" alt="Avatar"></figure>
//             </div>
//             <div class="tile-content">
//                 <p class="tile-title text-bold">Thor Odinson</p>
//                 <p class="tile-subtitle">Earth's Mightiest Heroes joined forces to take on threats that were too big for any one hero to tackle...</p>
//             </div>
