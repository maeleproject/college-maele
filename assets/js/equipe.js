/* ==========================================================================
   Collège Maele — données de l'équipe (direction et corps enseignant)
   Pour ajouter un professeur : ajoutez une ligne dans PROFESSEURS
   [titre, prénom(s), NOM, [matières], n° de photo]
   La photo portrait correspondante doit se trouver dans
   Images/Professeurs/portraits/<n°>.webp (format 4:5, 480 × 600 px)
   et la photo d'origine dans Images/Professeurs/<n°>.webp.
   ========================================================================== */
(function () {
  "use strict";

  var DEPARTEMENTS = {
    sciences:    { label: "Sciences", icon: "fa-flask", desc: "SVT, chimie, physique et technologie" },
    maths:       { label: "Mathématiques", icon: "fa-square-root-variable", desc: "Algèbre, géométrie, analyse et statistique" },
    langues:     { label: "Langues & Lettres", icon: "fa-feather-pointed", desc: "Français, anglais et latin" },
    humaines:    { label: "Sciences humaines", icon: "fa-landmark", desc: "Histoire et géographie" },
    arts:        { label: "Arts & Numérique", icon: "fa-compass-drafting", desc: "Dessin, dessin scientifique et TIC" },
    formation:   { label: "Formation humaine", icon: "fa-hands-praying", desc: "Religion, catéchèse, éducation à la vie et éducation physique" },
    encadrement: { label: "Encadrement", icon: "fa-book-open-reader", desc: "Bibliothèque et surveillance" }
  };

  var MATIERE_DEPT = {
    "SVT": "sciences", "Chimie": "sciences", "Physique": "sciences", "Technologie": "sciences",
    "Mathématiques": "maths",
    "Français": "langues", "Anglais": "langues", "Latin": "langues",
    "Histoire": "humaines", "Géographie": "humaines",
    "Dessin": "arts", "Dessin scientifique": "arts", "TIC": "arts",
    "Éducation à la vie": "formation", "Catéchèse": "formation", "Religion": "formation", "Éducation physique": "formation",
    "Bibliothécaire": "encadrement", "Surveillant": "encadrement"
  };

  var PROFESSEURS = [
    ["", "Trésor", "KISONDOKOLO", ["Technologie", "Physique"], 1],
    ["", "Germaine", "HAWA SUNGA", ["Éducation à la vie"], 2],
    ["Sœur", "", "YUMA SAFINIA", ["Catéchèse"], 3],
    ["", "Jean de la Croix", "KATSUVA", ["Anglais"], 5],
    ["", "Diaz", "MATIKALI", ["Français"], 6],
    ["", "Cédric", "KAYEMBE", ["Mathématiques", "Physique", "Technologie"], 7],
    ["", "Yvon", "TSHITENDA", ["Dessin scientifique", "Physique", "Mathématiques"], 8],
    ["", "Scolastique", "AMISI", ["TIC"], 9],
    ["", "Luc", "BOMBANGA", ["Éducation à la vie", "Français"], 10],
    ["", "Alain", "OTEPA", ["Français"], 11],
    ["", "Jephté", "MUMBERE", ["Latin", "Français"], 12],
    ["", "Grâce", "AMBWA", ["Anglais"], 13],
    ["", "Peter", "KAKEYI", ["SVT"], 14],
    ["", "Faustin", "LINGOMBO MONDENGA", ["Français"], 15],
    ["", "Michel", "KILYOBO KIMWANGA", ["SVT", "Chimie"], 16],
    ["", "Floribert", "ILONGA BIKI", ["Mathématiques"], 17],
    ["", "Paulin", "KASONGO NSENGA", ["Anglais"], 18],
    ["", "John", "KAMANGO", ["SVT"], 19],
    ["", "Edo", "KAPITA", ["Mathématiques"], 20],
    ["", "Justin", "NGONGO KIBONDO", ["Mathématiques"], 21],
    ["", "Alfonse", "IGWANGOZI BUMBA", ["Français"], 22],
    ["", "Gérard", "BASILA LABAMA", ["Éducation physique"], 23],
    ["", "Joseph", "LITETE BOBINA", ["SVT"], 24],
    ["", "Lucien", "RAMAZANI MUNGANGA", ["Géographie"], 25],
    ["", "Donat", "MWAMBA WETU TSHIALU", ["Français"], 26],
    ["", "Édouard", "LOBOLO AMURI", ["Anglais"], 27],
    ["", "Alain", "AMSINI", ["Français"], 28],
    ["", "Georges", "LIKENGE LOTIKA", ["Mathématiques"], 29],
    ["", "Marie", "BOYOMA MATOLO", ["Dessin"], 30],
    ["", "Martin", "MUHINDO BUSANGI", ["Mathématiques"], 31],
    ["", "José", "MAKANGA", ["Bibliothécaire"], 32],
    ["", "Jean Floribert", "MONDONDO MONGITA", ["Histoire"], 33],
    ["", "Evariste", "LITHO LOULA", ["Français"], 34],
    ["Père", "Joseph-Prince", "EKAGNY", ["Religion"], 35],
    ["", "Rachel", "SOMANA", ["Dessin"], 36],
    ["", "François", "KOSHI KILOLO", ["Géographie"], 37],
    ["", "Franck", "YANYONGO MAINGOLO", ["TIC"], 38],
    ["", "Franck", "MUMBERE", ["Latin"], 39],
    ["", "Albert", "BUKASA", ["Histoire"], 40],
    ["", "Dieu-Merci", "BOLONGE", ["Physique"], 41],
    ["", "Emmanuel", "AMURI", ["Surveillant"], 42]
  ];

  var DIRECTION = [
    { nom: "M. Jean-Claude Kazadi", role: "Préfet des études", photo: "Images/direction/portraits/prefet.webp" },
    { nom: "M. Richard Essymandra", role: "Directeur des études", photo: "Images/direction/portraits/directeur-etudes-essymandra.webp" },
    { nom: "M. Clément Lugaluga", role: "Directeur des études", photo: "Images/direction/portraits/directeur-etudes-lugaluga.webp" },
    { nom: "M. Pierre Kasongo", role: "Directeur de discipline", photo: "Images/direction/portraits/directeur-discipline.webp" },
    { nom: "Sœur Yuma Safinia", role: "Intendante", photo: "Images/Professeurs/portraits/3.webp" }
  ];

  var LIBELLES = { "Bibliothécaire": "Bibliothécaire", "Surveillant": "Professeur et surveillant" };

  var professeurs = PROFESSEURS.map(function (p) {
    var depts = [];
    p[3].forEach(function (m) {
      var d = MATIERE_DEPT[m];
      if (d && depts.indexOf(d) === -1) depts.push(d);
    });
    var titre = p[0], prenom = p[1], nom = p[2];
    return {
      id: p[4],
      titre: titre,
      prenom: prenom,
      nom: nom,
      nomComplet: [titre, prenom, nom].filter(Boolean).join(" "),
      matieres: p[3],
      libelle: p[3].map(function (m) { return LIBELLES[m] || m; }).join(" · "),
      departements: depts,
      portrait: "Images/Professeurs/portraits/" + p[4] + ".webp",
      photo: "Images/Professeurs/" + p[4] + ".webp"
    };
  });

  var collator = new Intl.Collator("fr", { sensitivity: "base" });
  professeurs.sort(function (a, b) { return collator.compare(a.nom, b.nom) || collator.compare(a.prenom, b.prenom); });

  window.MAELE_EQUIPE = { departements: DEPARTEMENTS, professeurs: professeurs, direction: DIRECTION };
})();
