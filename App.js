// On sort — version native (Expo / React Native)
// Données de test : tarifs et horaires indicatifs. Photos : Wikimedia Commons. Agenda : Que faire à Paris (Ville de Paris).
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Image, Modal, StyleSheet,
  Linking, Share, Platform, StatusBar, useWindowDimensions, ActivityIndicator, SafeAreaView, FlatList, Switch, Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ============ Données (reprises de la version web) ============ */
var ALL=[0,1,2,3,4,5,6], NOMON=[0,2,3,4,5,6], NOTUE=[0,1,3,4,5,6];
var P=[
 {id:"acclim",name:"Jardin d'Acclimatation",area:"Bois de Boulogne · 16e",lat:48.8785,lng:2.2640,cat:"Loisirs",io:"Plein air",a:[0,12],ad:7,en:7,note:"Gratuit moins de 3 ans · attractions en supplément",days:ALL,hours:"10h – 19h",offer:10,desc:"Manèges, animaux de la ferme, aires de jeux et rivière enchantée, au bord du Bois de Boulogne."},
 {id:"menagerie",name:"Ménagerie du Jardin des Plantes",area:"5e",lat:48.8445,lng:2.3600,cat:"Animaux",io:"Plein air",a:[0,99],ad:13,en:10,note:"Gratuit moins de 3 ans",days:ALL,hours:"9h – 17h",offer:10,desc:"L'un des plus vieux zoos du monde : pandas roux, orangs-outans, reptiles, au cœur du Jardin des Plantes."},
 {id:"zoo",name:"Parc zoologique de Paris",area:"Bois de Vincennes · 12e",lat:48.8325,lng:2.4155,cat:"Animaux",io:"Plein air",a:[0,99],ad:22,en:17,note:"Gratuit moins de 3 ans",days:ALL,hours:"10h – 17h",offer:0,desc:"Girafes, lions, grande serre tropicale : prévoir une demi-journée."},
 {id:"citeenfants",name:"Cité des enfants",area:"Cité des sciences · 19e",lat:48.8957,lng:2.3878,cat:"Sciences",io:"Intérieur",a:[2,12],ad:12,en:12,note:"Séances de 1h30, réservation conseillée",days:NOMON,hours:"10h – 18h",hc:true,offer:0,desc:"Deux espaces d'expériences à manipuler : 2-7 ans et 5-12 ans."},
 {id:"evolution",name:"Grande Galerie de l'Évolution",area:"5e",lat:48.8422,lng:2.3562,cat:"Musée",io:"Intérieur",a:[3,99],ad:13,en:null,note:"Tarif enfant : voir le site",days:NOTUE,hours:"10h – 18h",hc:true,offer:0,desc:"La caravane des animaux naturalisés, une galerie des enfants et des espèces disparues."},
 {id:"petitpalais",name:"Petit Palais",area:"8e",lat:48.8661,lng:2.3147,cat:"Musée",io:"Intérieur",a:[4,99],ad:0,en:0,note:"Collections permanentes gratuites",days:NOMON,hours:"10h – 18h",hc:true,offer:0,desc:"Un palais doré, un jardin intérieur et des livrets-jeux pour les enfants."},
 {id:"branly",name:"Musée du quai Branly",area:"7e",lat:48.8609,lng:2.2978,cat:"Musée",io:"Intérieur",a:[4,99],ad:14,en:0,note:"Gratuit moins de 18 ans",days:NOMON,hours:"10h30 – 19h",hc:true,offer:0,desc:"Masques, totems et instruments du monde entier, avec un jardin à explorer."},
 {id:"armee",name:"Musée de l'Armée",area:"Invalides · 7e",lat:48.8556,lng:2.3125,cat:"Musée",io:"Intérieur",a:[6,99],ad:15,en:0,note:"Gratuit moins de 18 ans",days:ALL,hours:"10h – 18h",hc:true,offer:0,desc:"Armures de chevaliers et tombeau de Napoléon : un classique des 7-12 ans."},
 {id:"artsmetiers",name:"Musée des Arts et Métiers",area:"3e",lat:48.8665,lng:2.3555,cat:"Sciences",io:"Intérieur",a:[6,99],ad:12,en:0,note:"Gratuit moins de 18 ans",days:NOMON,hours:"10h – 18h",hc:true,offer:0,desc:"Avions, automates et le pendule de Foucault dans une ancienne église."},
 {id:"grandpalais",name:"Palais des enfants · Grand Palais",area:"8e",lat:48.8661,lng:2.3125,cat:"Loisirs",io:"Intérieur",a:[2,10],ad:null,en:null,note:"Tarifs : voir le site",days:NOMON,hours:"Horaires : voir le site",hc:true,isNew:true,offer:0,desc:"Un espace dédié aux 2-10 ans dans le Grand Palais rénové."},
 {id:"philharmonie",name:"Espace enfants · Philharmonie",area:"La Villette · 19e",lat:48.8919,lng:2.3940,cat:"Musique",io:"Intérieur",a:[4,10],ad:null,en:null,note:"Tarifs : voir le site",days:NOMON,hours:"Horaires : voir le site",hc:true,isNew:true,offer:0,desc:"Un nouvel espace de 1 000 m² pour découvrir la musique en jouant, pour les 4-10 ans."},
 {id:"museeherbe",name:"Musée en Herbe",area:"1er",lat:48.8620,lng:2.3412,cat:"Musée",io:"Intérieur",a:[2,12],ad:null,en:null,note:"Tarifs : voir le site",days:ALL,hours:"10h – 19h",hc:true,offer:10,desc:"Expositions d'art pensées pour les enfants, avec baby-visites dès 2 ans."},
 {id:"aquarium",name:"Aquarium de Paris",area:"Trocadéro · 16e",lat:48.8620,lng:2.2905,cat:"Animaux",io:"Intérieur",a:[0,99],ad:null,en:null,note:"Tarifs : voir le site",days:ALL,hours:"10h – 19h",offer:0,desc:"Requins, méduses et bassin tactile, juste en face de la tour Eiffel."},
 {id:"buttes",name:"Parc des Buttes-Chaumont",area:"19e",lat:48.8809,lng:2.3828,cat:"Parc",io:"Plein air",a:[0,99],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"7h – 20h",offer:0,desc:"Falaises, pont suspendu, grotte et aires de jeux : le parc le plus spectaculaire de Paris."},
 {id:"bercy",name:"Parc de Bercy",area:"12e",lat:48.8355,lng:2.3835,cat:"Parc",io:"Plein air",a:[0,12],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"8h – 19h",offer:0,desc:"Grandes pelouses, potager, aires de jeux et skatepark."},
 {id:"luxembourg",name:"Jardin du Luxembourg",area:"6e",lat:48.8462,lng:2.3372,cat:"Parc",io:"Plein air",a:[0,12],ad:0,en:0,note:"Marionnettes et manèges payants",days:ALL,hours:"8h – 17h",offer:0,desc:"Voiliers sur le bassin, théâtre de marionnettes et grande aire de jeux."},
 {id:"villette",name:"Parc de la Villette",area:"19e",lat:48.8938,lng:2.3920,cat:"Parc",io:"Plein air",a:[0,99],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"Ouvert en continu",offer:0,desc:"Jardins à thème, toboggan dragon et grands espaces au bord du canal."},
 {id:"tuileries",name:"Jardin des Tuileries",area:"1er",lat:48.8635,lng:2.3275,cat:"Parc",io:"Plein air",a:[0,99],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"7h30 – 19h30",offer:0,desc:"Trampolines, voiliers et grande allée entre le Louvre et la Concorde."},
 {id:"monceau",name:"Parc Monceau",area:"8e",lat:48.8797,lng:2.3088,cat:"Parc",io:"Plein air",a:[0,10],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"7h – 20h",offer:0,desc:"Petit parc élégant avec manège, aire de jeux et folies à explorer."},
 {id:"montsouris",name:"Parc Montsouris",area:"14e",lat:48.8222,lng:2.3380,cat:"Parc",io:"Plein air",a:[0,12],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"8h – 19h",offer:0,desc:"Lac avec canards, cascade et pelouses ouvertes."},
 {id:"citroen",name:"Parc André-Citroën",area:"15e",lat:48.8410,lng:2.2750,cat:"Parc",io:"Plein air",a:[0,12],ad:0,en:0,note:"Ballon captif payant",days:ALL,hours:"8h – 19h",offer:0,desc:"Jets d'eau où courir l'été, serres et grandes pelouses."},
 {id:"belleville",name:"Parc de Belleville",area:"20e",lat:48.8715,lng:2.3850,cat:"Parc",io:"Plein air",a:[3,12],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"8h – 19h",offer:0,desc:"Belvédère sur Paris et l'une des plus grandes aires de jeux en bois de la ville."},
 {id:"floral",name:"Parc floral de Paris",area:"Bois de Vincennes · 12e",lat:48.8380,lng:2.4430,cat:"Parc",io:"Plein air",a:[0,12],ad:0,en:0,note:"Payant certains jours d'été",days:ALL,hours:"9h30 – 17h",offer:0,desc:"Immense aire de jeux, mini-golf et jardins."},
 {id:"ferme",name:"Ferme de Paris",area:"Bois de Vincennes · 12e",lat:48.8205,lng:2.4545,cat:"Animaux",io:"Plein air",a:[0,12],ad:0,en:0,note:"Entrée libre",days:[0,6],hours:"Week-end, après-midi",offer:0,desc:"Vaches, cochons, moutons et potager : une vraie ferme dans Paris."},
 {id:"daumesnil",name:"Barques du lac Daumesnil",area:"Bois de Vincennes · 12e",lat:48.8330,lng:2.4100,cat:"Loisirs",io:"Plein air",a:[4,99],ad:null,en:null,note:"Location à l'heure, en saison",days:ALL,months:[3,4,5,6,7,8,9,10],hours:"Selon météo",offer:0,desc:"Ramer en famille autour des îles du lac."},
 {id:"versailles",name:"Château de Versailles",area:"Versailles · 78",lat:48.8049,lng:2.1204,cat:"Château",io:"Mixte",a:[6,99],ad:21,en:0,note:"Gratuit moins de 18 ans · jardins gratuits hors spectacles",days:NOMON,hours:"9h – 17h30",hc:true,offer:0,desc:"Le château, puis les jardins et le Hameau de la Reine pour se dépenser."},
 {id:"sceaux",name:"Domaine de Sceaux",area:"Sceaux · 92",lat:48.7735,lng:2.2990,cat:"Parc",io:"Plein air",a:[0,99],ad:0,en:0,note:"Entrée libre",days:ALL,hours:"8h – 17h",offer:0,desc:"Grand canal, cascades et pique-nique au pied du château."},
 {id:"saintcloud",name:"Domaine national de Saint-Cloud",area:"Saint-Cloud · 92",lat:48.8400,lng:2.2120,cat:"Parc",io:"Plein air",a:[0,99],ad:0,en:0,note:"Entrée libre à pied",days:ALL,hours:"7h30 – 20h",offer:0,desc:"460 hectares de parc et une vue sur tout Paris."},
 {id:"cergy",name:"Île de loisirs de Cergy-Pontoise",area:"Cergy · 95",lat:49.0260,lng:2.0400,cat:"Loisirs",io:"Plein air",a:[4,99],ad:0,en:null,note:"Entrée libre · activités payantes",days:ALL,hours:"Selon activités",offer:0,desc:"Étangs, accrobranche, téléski nautique et baignade l'été."},
 {id:"disney",name:"Disneyland Paris",area:"Marne-la-Vallée · 77",lat:48.8722,lng:2.7758,cat:"Loisirs",io:"Mixte",a:[3,99],ad:null,en:null,note:"Prix variable selon la date",days:ALL,hours:"Voir le site",offer:0,desc:"Deux parcs à thèmes, à réserver à l'avance."},
 {id:"asterix",name:"Parc Astérix",area:"Plailly · 60",lat:49.1341,lng:2.5710,cat:"Loisirs",io:"Plein air",a:[3,99],ad:null,en:null,note:"Prix variable selon la date",days:ALL,months:[4,5,6,7,8,9,10],hours:"Saison d'avril à début novembre",offer:0,desc:"Montagnes russes et villages gaulois, à environ 35 km au nord de Paris."},
 {id:"miniature",name:"France Miniature",area:"Élancourt · 78",lat:48.7713,lng:1.9693,cat:"Loisirs",io:"Plein air",a:[3,12],ad:null,en:null,note:"Tarifs : voir le site",days:ALL,months:[4,5,6,7,8,9,10],hours:"Saison d'avril à octobre",offer:0,desc:"Les monuments de France en miniature, plus quelques attractions."}
];
P.push(
 {id:"orsay",name:"Musée d'Orsay",area:"7e",lat:48.8600,lng:2.3266,cat:"Musée",io:"Intérieur",a:[6,99],ad:null,en:0,note:"Gratuit moins de 18 ans · tarif adulte : voir le site",days:NOMON,hours:"9h30 – 18h",hc:true,offer:0,f1:{resa:"obligatoire"},desc:"Horloges géantes, animaux sculptés de Pompon et peintres impressionnistes, dans une ancienne gare."},
 {id:"carnavalet",name:"Musée Carnavalet",area:"Marais · 3e",lat:48.8575,lng:2.3624,cat:"Musée",io:"Intérieur",a:[6,99],ad:0,en:0,note:"Collections permanentes gratuites toute l'année",days:NOMON,hours:"10h – 18h",hc:true,offer:0,desc:"L'histoire de Paris en enseignes, maquettes et boutiques reconstituées."},
 {id:"mam",name:"Musée d'Art Moderne de Paris",area:"16e",lat:48.8641,lng:2.2977,cat:"Musée",io:"Intérieur",a:[4,99],ad:0,en:0,note:"Collections permanentes gratuites toute l'année",days:NOMON,hours:"10h – 18h",hc:true,offer:0,desc:"De grandes toiles très colorées, dont l'immense Fée Électricité de Dufy."},
 {id:"chasse",name:"Musée de la Chasse et de la Nature",area:"Marais · 3e",lat:48.8614,lng:2.3612,cat:"Musée",io:"Intérieur",a:[5,99],ad:null,en:null,note:"Gratuit le 1er dimanche du mois",days:NOMON,hours:"11h – 18h",hc:true,offer:0,f1:{resa:"conseillée"},desc:"Animaux naturalisés et cabinets de curiosités, dans un hôtel particulier du Marais."}
);
P.forEach(function(p){if(p.id==="branly")p.f1={resa:"conseillée"};if(p.id==="artsmetiers")p.f1={};if(p.id==="versailles")p.f1={months:[1,2,3,11,12],resa:"conseillée"};});
P.forEach(function(p){p.free3=/moins de 3 ans/.test(p.note);});
var PLACES=[
 ["Paris 1er",48.8626,2.3363],["Paris 2e",48.8683,2.3428],["Paris 3e",48.8630,2.3600],["Paris 4e",48.8543,2.3576],["Paris 5e",48.8445,2.3500],["Paris 6e",48.8491,2.3328],["Paris 7e",48.8562,2.3121],["Paris 8e",48.8727,2.3125],["Paris 9e",48.8770,2.3375],["Paris 10e",48.8761,2.3607],["Paris 11e",48.8591,2.3800],["Paris 12e",48.8400,2.3950],["Paris 13e",48.8283,2.3623],["Paris 14e",48.8292,2.3266],["Paris 15e",48.8401,2.2930],["Paris 16e",48.8604,2.2620],["Paris 17e",48.8873,2.3067],["Paris 18e",48.8925,2.3484],["Paris 19e",48.8871,2.3848],["Paris 20e",48.8634,2.4012],
 ["Boulogne-Billancourt",48.8397,2.2399],["Vincennes",48.8475,2.4390],["Montreuil",48.8611,2.4433],["Saint-Denis",48.9362,2.3574],["Nanterre",48.8924,2.2069],["Créteil",48.7904,2.4556],["Versailles",48.8049,2.1204]
];

var TINT={Agenda:["#FFE1EC","#A3164F"],Parc:["#DFF5D3","#1E6B3A"],Animaux:["#FFE1D6","#A8300C"],Musée:["#EDE4FF","#5B34B8"],Sciences:["#DCE8FF","#1F4FC2"],Loisirs:["#FFF0B8","#6E4D00"],Musique:["#EDE4FF","#5B34B8"],Château:["#FFF0B8","#6E4D00"]};
function flower(x,y,c){return '<g fill="'+c+'"><circle cx="'+x+'" cy="'+(y-5)+'" r="4.2"/><circle cx="'+(x-5)+'" cy="'+y+'" r="4.2"/><circle cx="'+(x+5)+'" cy="'+y+'" r="4.2"/><circle cx="'+x+'" cy="'+(y+5)+'" r="4.2"/></g><circle cx="'+x+'" cy="'+y+'" r="3" fill="#FFC93D"/>';}
/* Illustrations maison, une par lieu (viewBox 64×64) */
var ILL={
 acclim:["#FFC93D",'<rect x="0" y="54" width="64" height="10" fill="#7BC67E"/><path d="M12 27 L32 11 L52 27Z" fill="#FF5B2E"/><path d="M32 11 L25 27 M32 11 L39 27" stroke="#fff" stroke-width="3"/><circle cx="32" cy="10" r="2.5" fill="#2F6BFF"/><rect x="12" y="27" width="40" height="4" fill="#fff"/><path d="M19 31v19M32 31v19M45 31v19" stroke="#0B0B0B" stroke-width="2"/><rect x="10" y="50" width="44" height="4" rx="2" fill="#0B0B0B"/><circle cx="19" cy="40" r="4.5" fill="#fff"/><circle cx="32" cy="44" r="4.5" fill="#2F6BFF"/><circle cx="45" cy="40" r="4.5" fill="#FF8FAB"/>'],
 menagerie:["#9BE3C6",'<path d="M15 23 L19 9 L28 18Z M49 23 L45 9 L36 18Z" fill="#A8300C"/><ellipse cx="32" cy="35" rx="21" ry="18" fill="#E8622C"/><ellipse cx="32" cy="43" rx="11" ry="8" fill="#fff"/><ellipse cx="22" cy="31" rx="5.5" ry="4.5" fill="#fff"/><ellipse cx="42" cy="31" rx="5.5" ry="4.5" fill="#fff"/><circle cx="23" cy="32" r="2.4" fill="#0B0B0B"/><circle cx="41" cy="32" r="2.4" fill="#0B0B0B"/><ellipse cx="32" cy="40" rx="3.2" ry="2.2" fill="#0B0B0B"/>'],
 zoo:["#FFD6A5",'<circle cx="52" cy="12" r="5" fill="#FF9F1C"/><rect x="0" y="54" width="64" height="10" fill="#7BC67E"/><rect x="25" y="20" width="10" height="35" rx="4" fill="#F5B83D"/><ellipse cx="37" cy="18" rx="11" ry="6.5" fill="#F5B83D"/><path d="M31 11v-5M38 11v-5" stroke="#7A4A12" stroke-width="2.5" stroke-linecap="round"/><circle cx="40" cy="16" r="1.9" fill="#0B0B0B"/><circle cx="29" cy="28" r="2.6" fill="#B5651D"/><circle cx="32" cy="38" r="2.6" fill="#B5651D"/><circle cx="28.5" cy="47" r="2.6" fill="#B5651D"/>'],
 citeenfants:["#2F6BFF",'<circle cx="11" cy="14" r="1.6" fill="#fff"/><circle cx="53" cy="20" r="1.8" fill="#FFC93D"/><circle cx="49" cy="50" r="1.3" fill="#fff"/><circle cx="13" cy="46" r="1.3" fill="#FFC93D"/><path d="M32 7 C43 18 43 34 38.5 44 H25.5 C21 34 21 18 32 7Z" fill="#fff"/><circle cx="32" cy="25" r="5" fill="#9FD8F5" stroke="#0B0B0B" stroke-width="1.5"/><path d="M25.5 35 L17 46 L26 44Z M38.5 35 L47 46 L38 44Z" fill="#FF5B2E"/><path d="M27.5 44 L32 57 L36.5 44Z" fill="#FFC93D"/>'],
 evolution:["#C9B6FF",'<rect x="0" y="54" width="64" height="10" fill="#A58BEA"/><ellipse cx="36" cy="34" rx="18" ry="13" fill="#7D7F8C"/><circle cx="19" cy="28" r="10" fill="#7D7F8C"/><path d="M11 31 C6 41 8 51 15 51" stroke="#7D7F8C" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="27" rx="6" ry="8.5" fill="#9A9CA8"/><circle cx="16" cy="25" r="1.7" fill="#0B0B0B"/><rect x="23" y="42" width="7" height="12" rx="2" fill="#7D7F8C"/><rect x="41" y="42" width="7" height="12" rx="2" fill="#7D7F8C"/>'],
 petitpalais:["#FFE9A8",'<rect x="9" y="34" width="46" height="20" fill="#fff"/><path d="M20 34 A12 12 0 0 1 44 34Z" fill="#E0A82E"/><rect x="31" y="14" width="2" height="9" fill="#E0A82E"/><path d="M14 38v14M20 38v14M26 38v14M38 38v14M44 38v14M50 38v14" stroke="#E6D9B8" stroke-width="2"/><path d="M29 54v-10a3 3 0 0 1 6 0v10Z" fill="#E0A82E"/><rect x="5" y="54" width="54" height="4" fill="#0B0B0B"/>'],
 branly:["#1F7A5C",'<path d="M18 11 H46 V36 C46 49 39 57 32 57 C25 57 18 49 18 36Z" fill="#FFB547"/><path d="M18 18h28" stroke="#FF5B2E" stroke-width="3.5"/><path d="M22 25 L29 27 L22 31Z M42 25 L35 27 L42 31Z" fill="#0B0B0B"/><path d="M32 29v10" stroke="#A8300C" stroke-width="3"/><rect x="26" y="45" width="12" height="4" rx="2" fill="#A8300C"/><circle cx="8" cy="12" r="2" fill="#FFC93D"/><circle cx="56" cy="52" r="2" fill="#FFC93D"/>'],
 armee:["#D7E3FF",'<path d="M34 10 C44 3 53 9 50 18" stroke="#FF3B3B" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M18 31 C18 18 24 12 32 12 C40 12 46 18 46 31 V51 H18Z" fill="#9AA3B5"/><rect x="22" y="28" width="20" height="4" fill="#0B0B0B"/><path d="M32 34v17" stroke="#6B7385" stroke-width="2"/><circle cx="26" cy="43" r="1.5" fill="#6B7385"/><circle cx="38" cy="43" r="1.5" fill="#6B7385"/>'],
 artsmetiers:["#BEE7FF",'<circle cx="13" cy="14" r="4.5" fill="#fff"/><circle cx="19" cy="13" r="5.5" fill="#fff"/><ellipse cx="32" cy="35" rx="21" ry="5.5" fill="#FF5B2E"/><rect x="21" y="22" width="22" height="4.5" rx="2" fill="#FFC93D"/><rect x="21" y="43" width="22" height="4.5" rx="2" fill="#FFC93D"/><path d="M26 26v17M38 26v17" stroke="#0B0B0B" stroke-width="1.5"/><path d="M54 28v14" stroke="#0B0B0B" stroke-width="2.5" stroke-linecap="round"/><path d="M12 31 L7 24 L15 31Z" fill="#FF5B2E"/>'],
 grandpalais:["#FFB8D1",'<path d="M7 50 C7 25 57 25 57 50Z" fill="#9FD8F5"/><path d="M7 50 C7 25 57 25 57 50 M20 50 C20 34 44 34 44 50 M32 29v21 M13 40h38" stroke="#2E5E8C" stroke-width="1.6" fill="none"/><rect x="31" y="15" width="2" height="12" fill="#2E5E8C"/><path d="M33 15h9l-3 3 3 3h-9Z" fill="#FF3B6B"/><rect x="3" y="50" width="58" height="5" fill="#0B0B0B"/>'],
 philharmonie:["#8B5CF6",'<path d="M24 45V18l20-6v27" stroke="#fff" stroke-width="3.5" fill="none" stroke-linejoin="round"/><ellipse cx="19.5" cy="46" rx="6.5" ry="5" fill="#FFC93D"/><ellipse cx="39.5" cy="40" rx="6.5" ry="5" fill="#FFC93D"/><circle cx="11" cy="17" r="2.2" fill="#FF8FAB"/><circle cx="53" cy="51" r="2.6" fill="#FF8FAB"/><circle cx="52" cy="14" r="1.6" fill="#fff"/>'],
 museeherbe:["#FF8FAB",'<rect x="11" y="13" width="42" height="33" rx="2" fill="#FFC93D"/><rect x="15" y="17" width="34" height="25" fill="#fff"/><circle cx="26" cy="26" r="4.5" fill="#FF5B2E"/><path d="M15 42 L28 31 L36 37 L42 32 L49 38 V42Z" fill="#2F9E6B"/><path d="M43 57 L54 44" stroke="#0B0B0B" stroke-width="3" stroke-linecap="round"/><circle cx="55" cy="43" r="2.8" fill="#2F6BFF"/>'],
 aquarium:["#1EA7E1",'<rect x="0" y="54" width="64" height="10" fill="#FFD27A"/><path d="M9 36 C21 23 40 23 50 34 L59 27 L57 38 L59 47 L50 40 C40 49 21 49 9 36Z" fill="#E8F1F8"/><path d="M29 26 L34 17 L38 27Z" fill="#E8F1F8"/><circle cx="17" cy="34" r="1.9" fill="#0B0B0B"/><path d="M15 40h8" stroke="#0B0B0B" stroke-width="1.5"/><circle cx="20" cy="13" r="3" stroke="#fff" stroke-width="1.5" fill="none"/><circle cx="26" cy="7" r="2" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M8 54 q3 -7 0 -12 M56 54 q-3 -6 0 -10" stroke="#2F9E6B" stroke-width="3" fill="none" stroke-linecap="round"/>'],
 buttes:["#9FE0B5",'<rect x="0" y="48" width="64" height="16" fill="#4FB3E8"/><path d="M17 50 L24 26 L40 26 L47 50Z" fill="#B9B4A8"/><path d="M23 27 L32 17 L41 27Z" fill="#fff"/><rect x="25" y="21" width="14" height="6" fill="#fff"/><path d="M28 21v6M32 21v6M36 21v6" stroke="#B9B4A8" stroke-width="1"/><circle cx="9" cy="40" r="9" fill="#2F9E6B"/><circle cx="55" cy="40" r="9" fill="#2F9E6B"/><circle cx="50" cy="11" r="4.5" fill="#FFC93D"/>'],
 bercy:["#C8F2A6",'<circle cx="50" cy="12" r="5.5" fill="#FFC93D"/><rect x="0" y="46" width="64" height="18" fill="#7BC67E"/><rect x="18" y="32" width="3.5" height="16" fill="#7A4A12"/><circle cx="19.5" cy="26" r="11" fill="#2F9E6B"/><rect x="42" y="36" width="3" height="12" fill="#7A4A12"/><circle cx="43.5" cy="32" r="7.5" fill="#3FB86F"/><circle cx="29" cy="54" r="2.8" fill="#FF5B2E"/><circle cx="37" cy="57" r="2.8" fill="#FF5B2E"/><circle cx="45" cy="54" r="2.8" fill="#FF5B2E"/>'],
 luxembourg:["#BEE7FF",'<ellipse cx="32" cy="51" rx="29" ry="8.5" fill="#4FB3E8"/><path d="M32 13 V45" stroke="#0B0B0B" stroke-width="2"/><path d="M33 15 L49 41 H33Z" fill="#fff"/><path d="M31 20 L19 41 H31Z" fill="#FF5B2E"/><path d="M19 45 H47 L42 51 H24Z" fill="#7A4A12"/><path d="M32 13 L39 15.5 L32 18Z" fill="#2F6BFF"/>'],
 villette:["#FFC93D",'<rect x="0" y="52" width="64" height="12" fill="#7BC67E"/><path d="M9 52 C9 29 30 29 30 44 C30 29 50 25 52 40 L57 33 L57 44 L52 52Z" fill="#8B5CF6"/><circle cx="50" cy="38" r="2" fill="#fff"/><path d="M15 36 L19 29 L22 37 M26 32 L30 25 L31 34" fill="#FF5B2E" stroke="#FF5B2E" stroke-width="2" stroke-linejoin="round"/><path d="M13 52 C17 44 24 44 26 52" fill="#FFC93D"/>'],
 tuileries:["#FFD1DC",'<circle cx="32" cy="27" r="18" fill="none" stroke="#2F6BFF" stroke-width="2.5"/><path d="M32 9v36M14 27h36M19.3 14.3l25.4 25.4M44.7 14.3L19.3 39.7" stroke="#2F6BFF" stroke-width="1.2"/><circle cx="32" cy="9" r="3.4" fill="#FF5B2E"/><circle cx="50" cy="27" r="3.4" fill="#FFC93D"/><circle cx="32" cy="45" r="3.4" fill="#2F9E6B"/><circle cx="14" cy="27" r="3.4" fill="#8B5CF6"/><path d="M32 27 L21 57 M32 27 L43 57" stroke="#0B0B0B" stroke-width="2.5"/>'],
 monceau:["#E6D3FF",'<rect x="0" y="56" width="64" height="8" fill="#7BC67E"/><path d="M37 7 L51 22 L37 38 L23 22Z" fill="#FF5B2E"/><path d="M37 7 V38 M23 22 H51" stroke="#fff" stroke-width="1.6"/><path d="M37 38 C30 46 41 50 30 58" stroke="#0B0B0B" stroke-width="1.5" fill="none"/><path d="M34 46l-3 2 3 2M31 53l-3 2 3 2" stroke="#2F6BFF" stroke-width="2" fill="none"/>'],
 montsouris:["#BEE7FF",'<rect x="0" y="42" width="64" height="22" fill="#4FB3E8"/><ellipse cx="35" cy="40" rx="17" ry="9.5" fill="#FFC93D"/><circle cx="20" cy="28" r="8.5" fill="#FFC93D"/><path d="M12 28 L3 30 L12 33Z" fill="#FF5B2E"/><circle cx="19" cy="26" r="1.7" fill="#0B0B0B"/><path d="M28 38 C34 33 41 35 45 40" stroke="#E0A82E" stroke-width="2" fill="none"/><path d="M6 54 q4 -3 8 0 q4 3 8 0 M40 56 q4 -3 8 0 q4 3 8 0" stroke="#BEE7FF" stroke-width="1.6" fill="none"/>'],
 citroen:["#9FE0B5",'<circle cx="32" cy="24" r="17" fill="#FF5B2E"/><path d="M15 24h34 M32 7c-8.5 8.5-8.5 25.5 0 34 c8.5-8.5 8.5-25.5 0-34" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M23 36 L28 43 M41 36 L36 43" stroke="#0B0B0B" stroke-width="1.2"/><rect x="27" y="43" width="10" height="7" rx="1.5" fill="#0B0B0B"/><path d="M32 50v14" stroke="#0B0B0B" stroke-width="1" stroke-dasharray="2 2"/>'],
 belleville:["#FFB8A1",'<circle cx="45" cy="20" r="8.5" fill="#FFE07A"/><path d="M0 51 V41 H8 V35 H16 V43 H22 V37 H30 V45 H40 V39 H48 V45 H56 V37 H64 V51Z" fill="#6B4C9A"/><path d="M13 51 L18 15 L23 51" stroke="#0B0B0B" stroke-width="2" fill="none"/><path d="M15 36h6" stroke="#0B0B0B" stroke-width="2"/><rect x="0" y="51" width="64" height="13" fill="#3FB86F"/>'],
 floral:["#FFF1A8",'<rect x="0" y="50" width="64" height="14" fill="#7BC67E"/><path d="M16 50V30M32 50V22M48 50V32" stroke="#2F9E6B" stroke-width="2.5"/>'+flower(16,28,"#FF5B2E")+flower(32,19,"#FF8FAB")+flower(48,30,"#8B5CF6")],
 ferme:["#C8F2A6",'<rect x="0" y="52" width="64" height="12" fill="#7BC67E"/><rect x="12" y="24" width="35" height="20" rx="8" fill="#fff"/><circle cx="22" cy="30" r="4.2" fill="#0B0B0B"/><circle cx="38" cy="38" r="3.2" fill="#0B0B0B"/><rect x="16" y="42" width="4.5" height="10" fill="#fff"/><rect x="38" y="42" width="4.5" height="10" fill="#fff"/><ellipse cx="50" cy="24" rx="8.5" ry="7.5" fill="#fff"/><ellipse cx="53" cy="28.5" rx="5.5" ry="3.8" fill="#FFB8C8"/><circle cx="48" cy="21" r="1.5" fill="#0B0B0B"/><path d="M45 16l-3-4M54 16l3-4" stroke="#B9B4A8" stroke-width="2.5" stroke-linecap="round"/>'],
 daumesnil:["#9FD8F5",'<rect x="0" y="40" width="64" height="24" fill="#2F8FD8"/><path d="M7 40 H57 L51 50 H13Z" fill="#B5651D"/><path d="M19 30 L41 48" stroke="#7A4A12" stroke-width="2.5" stroke-linecap="round"/><circle cx="30" cy="28" r="4.5" fill="#FF5B2E"/><path d="M5 57 q4 -3 8 0 q4 3 8 0 M40 57 q4 -3 8 0 q4 3 8 0" stroke="#BEE7FF" stroke-width="1.6" fill="none"/>'],
 versailles:["#FFE07A",'<circle cx="32" cy="15" r="7" fill="#FF9F1C"/><path d="M32 3v4M44 15h4M16 15h4M41 6l3-3M23 6l-3-3" stroke="#FF9F1C" stroke-width="2" stroke-linecap="round"/><rect x="7" y="32" width="50" height="18" fill="#fff"/><path d="M7 32 L13 26 H51 L57 32Z" fill="#2E5E8C"/><path d="M13 36v10M19 36v10M25 36v10M39 36v10M45 36v10M51 36v10" stroke="#E0A82E" stroke-width="2"/><rect x="29" y="38" width="6" height="12" fill="#E0A82E"/><rect x="0" y="50" width="64" height="14" fill="#3FB86F"/>'],
 sceaux:["#BEE7FF",'<rect x="0" y="40" width="64" height="24" fill="#7BC67E"/><path d="M26 64 L30 40 H34 L38 64Z" fill="#4FB3E8"/><path d="M9 45 L14 23 L19 45Z M45 45 L50 23 L55 45Z M19 42 L23 28 L27 42Z M37 42 L41 28 L45 42Z" fill="#2F9E6B"/><rect x="24" y="30" width="16" height="10" fill="#fff"/><path d="M23 30 L32 23 L41 30Z" fill="#A8300C"/>'],
 saintcloud:["#FFD6A5",'<rect x="0" y="44" width="64" height="20" fill="#3FB86F"/><rect x="15" y="40" width="34" height="8" rx="2" fill="#4FB3E8"/><path d="M32 40 C30 30 34 23 32 12 M24 40 C23 34 26 30 24 25 M40 40 C41 34 38 30 40 25" stroke="#4FB3E8" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="9" cy="36" r="9" fill="#2F9E6B"/><circle cx="55" cy="36" r="9" fill="#2F9E6B"/>'],
 cergy:["#FFC93D",'<circle cx="49" cy="15" r="7.5" fill="#FF5B2E"/><rect x="0" y="42" width="64" height="22" fill="#1EA7E1"/><path d="M0 43 q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0" fill="#1EA7E1"/><path d="M13 41 L40 41" stroke="#0B0B0B" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="21" r="3.8" fill="#0B0B0B"/><path d="M26 25 L28 37 M28 30 L38 26" stroke="#0B0B0B" stroke-width="3" stroke-linecap="round"/><path d="M38 26 L60 19" stroke="#0B0B0B" stroke-width="1"/>'],
 disney:["#2E2A6B",'<circle cx="14" cy="14" r="2.2" fill="#FFC93D"/><path d="M14 7v-3M14 21v3M7 14h-3M21 14h3" stroke="#FFC93D" stroke-width="1.6" stroke-linecap="round"/><path d="M45 8 l2.2 4.5 5 .7 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.7Z" fill="#FF8FAB"/><rect x="0" y="50" width="64" height="14" fill="#1B1840"/><path d="M3 50 C13 19 24 19 30 40 C36 57 47 23 61 30" stroke="#FF5B2E" stroke-width="3.2" fill="none"/><path d="M11 50v-15M22 50v-23M37 50v-6M49 50v-21" stroke="#fff" stroke-width="1.2"/>'],
 asterix:["#FF8FAB",'<rect x="0" y="52" width="64" height="12" fill="#7BC67E"/><circle cx="32" cy="30" r="14" fill="none" stroke="#A8300C" stroke-width="4"/><path d="M3 52 C12 52 18 44 22 40 M42 40 C46 44 52 52 61 52" stroke="#A8300C" stroke-width="4" fill="none"/><path d="M20 52V38M32 52V44M44 52V38" stroke="#7A4A12" stroke-width="2"/><rect x="27" y="12.5" width="10" height="5" rx="2" fill="#FFC93D"/>'],
 miniature:["#9FE0B5",'<rect x="0" y="50" width="64" height="14" fill="#3FB86F"/><path d="M19 50 L25 18 L31 50" stroke="#B5651D" stroke-width="2.5" fill="none"/><path d="M21 40h8M23 30h4" stroke="#B5651D" stroke-width="2"/><circle cx="42" cy="31" r="10.5" fill="#fff" fill-opacity=".55" stroke="#0B0B0B" stroke-width="3"/><path d="M49.5 38.5 L58 47" stroke="#0B0B0B" stroke-width="4.5" stroke-linecap="round"/>']
};
ILL.orsay=["#FFE07A",'<circle cx="32" cy="30" r="20" fill="#fff" stroke="#0B0B0B" stroke-width="3"/><path d="M32 14v4M32 42v4M16 30h4M44 30h4" stroke="#0B0B0B" stroke-width="2"/><path d="M32 30V19M32 30l8 5" stroke="#FF5B2E" stroke-width="3" stroke-linecap="round"/><rect x="6" y="54" width="52" height="4" fill="#0B0B0B"/>'];
ILL.carnavalet=["#BEE7FF",'<path d="M14 10h4v40h-4z" fill="#0B0B0B"/><path d="M18 14h30v4H18z" fill="#0B0B0B"/><rect x="24" y="18" width="22" height="16" rx="3" fill="#FFC93D" stroke="#0B0B0B" stroke-width="2"/><path d="M29 26h12" stroke="#A8300C" stroke-width="3" stroke-linecap="round"/><rect x="0" y="50" width="64" height="14" fill="#7BC67E"/>'];
ILL.mam=["#FFD1DC",'<rect x="8" y="12" width="48" height="34" fill="#fff" stroke="#0B0B0B" stroke-width="2"/><rect x="12" y="16" width="12" height="26" fill="#2F6BFF"/><rect x="26" y="16" width="12" height="26" fill="#FFC93D"/><rect x="40" y="16" width="12" height="26" fill="#FF5B2E"/><path d="M14 22l8 6-8 6M42 22l8 4-8 4" stroke="#fff" stroke-width="2" fill="none"/><rect x="6" y="54" width="52" height="4" fill="#0B0B0B"/>'];
ILL.chasse=["#C8F2A6",'<path d="M20 12 L24 24 M18 18h7 M44 12 L40 24 M46 18h-7" stroke="#7A4A12" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="34" rx="11" ry="14" fill="#B5651D"/><ellipse cx="32" cy="42" rx="6" ry="5" fill="#E6C29A"/><circle cx="27" cy="31" r="1.8" fill="#0B0B0B"/><circle cx="37" cy="31" r="1.8" fill="#0B0B0B"/><path d="M22 24 C16 22 14 28 20 30 M42 24 C48 22 50 28 44 30" fill="#B5651D"/><rect x="18" y="52" width="28" height="6" rx="2" fill="#7A4A12"/>'];

var PQ={orsay:"Musée d'Orsay nef",carnavalet:"Musée Carnavalet",mam:"Musée d'Art Moderne de Paris",chasse:"Musée de la Chasse et de la Nature",acclim:"Jardin d'Acclimatation Paris",menagerie:"Ménagerie du Jardin des Plantes",zoo:"Parc zoologique de Paris",citeenfants:"Cité des sciences et de l'industrie",evolution:"Grande Galerie de l'Évolution",petitpalais:"Petit Palais Paris",branly:"Musée du quai Branly",armee:"Musée de l'Armée Invalides",artsmetiers:"Musée des Arts et Métiers",grandpalais:"Grand Palais Paris nef",philharmonie:"Philharmonie de Paris",museeherbe:"Musée en Herbe Paris",aquarium:"Aquarium de Paris Trocadéro",buttes:"Parc des Buttes-Chaumont",bercy:"Parc de Bercy",luxembourg:"Jardin du Luxembourg bassin",villette:"Parc de la Villette",tuileries:"Jardin des Tuileries",monceau:"Parc Monceau",montsouris:"Parc Montsouris",citroen:"Parc André-Citroën",belleville:"Parc de Belleville",floral:"Parc floral de Paris",ferme:"Ferme de Paris Vincennes",daumesnil:"Lac Daumesnil",versailles:"Château de Versailles",sceaux:"Domaine de Sceaux",saintcloud:"Domaine national de Saint-Cloud",cergy:"Île de loisirs de Cergy-Pontoise",miniature:"France Miniature Élancourt"};


const C = { ink: '#0B0B0B', paper: '#FFFFFF', soft: '#F2F2F0', line: '#E6E6E2', muted: '#5E5E5A', accent: '#FF5B2E', accentInk: '#A8300C', blue: '#2F6BFF', green: '#1E6B3A' };
const WEB = 'https://devbl770.github.io/on-sort';
const LOGO_URI = WEB + '/icon-192.png';
const LOGO_UNUSED = '<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#FF5B2E"/><path d="M60.85 66.14 A22 22 0 1 1 60.85 37.86" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/><path d="M44 52 H80" stroke="#0B0B0B" stroke-width="10" stroke-linecap="round"/><path d="M69 40.5 L81 52 L69 63.5" fill="none" stroke="#0B0B0B" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function illXml(id) { const d = ILL[id] || ['#F2F2F0', '']; return '<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="' + d[0] + '"/>' + d[1] + '</svg>'; }

/* ============ Dates : fériés, vacances zone C, 1er dimanche ============ */
function easter(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
const HOL = {};
[new Date().getFullYear(), new Date().getFullYear() + 1].forEach(function (y) {
  [[0, 1, "Jour de l'an"], [4, 1, 'Fête du Travail'], [4, 8, 'Victoire 1945'], [6, 14, 'Fête nationale'], [7, 15, 'Assomption'], [10, 1, 'Toussaint'], [10, 11, 'Armistice'], [11, 25, 'Noël']].forEach(function (h) { HOL[key(new Date(y, h[0], h[1]))] = h[2]; });
  const e = easter(y); HOL[key(addDays(e, 1))] = 'Lundi de Pâques'; HOL[key(addDays(e, 39))] = 'Ascension'; HOL[key(addDays(e, 50))] = 'Lundi de Pentecôte';
});
const holName = (d) => HOL[key(d)] || null;
// Vacances zone C (arrêté du 22 octobre 2025) : premier jour, jour de reprise
const VAC = [[2026, 11, 19, 2027, 0, 4, 'Vacances de Noël'], [2027, 1, 6, 2027, 1, 22, "Vacances d'hiver"], [2027, 3, 3, 2027, 3, 19, 'Vacances de printemps'], [2027, 6, 3, 2027, 8, 1, "Vacances d'été"]];
function vacName(d) { for (const v of VAC) { if (d >= new Date(v[0], v[1], v[2]) && d < new Date(v[3], v[4], v[5])) return v[6]; } return null; }
const DOW = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'], MON = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const fmtDay = (d) => DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()];
const now0 = new Date(); const TODAY = new Date(now0.getFullYear(), now0.getMonth(), now0.getDate());
const firstSun = (d) => d.getDay() === 0 && d.getDate() <= 7;
function nextHoliday() { for (let i = 1; i < 400; i++) { const d = addDays(TODAY, i); if (holName(d)) return d; } return null; }
function bigClosed(d) { const m = d.getMonth(), n = d.getDate(); return (m === 0 && n === 1) || (m === 4 && n === 1) || (m === 11 && n === 25); }
function isOpen(p, d) {
  if (p.evt) return d >= p.ds0 && d <= p.de0;
  if (p.months && p.months.indexOf(d.getMonth() + 1) < 0) return false;
  if (p.days.indexOf(d.getDay()) < 0) return false;
  if (p.hc && bigClosed(d)) return false;
  return true;
}

/* ============ Calculs ============ */
function dist(a, b, c, d) { const R = 6371, t = Math.PI / 180, x = (c - a) * t, y = (d - b) * t, h = Math.sin(x / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function tminK(k) { return k < 1.6 ? k * 13 : k < 25 ? 10 + k * 3.2 : k * 1.1; }
function travel(k) { if (k < 1.6) return Math.max(3, Math.round(k * 13)) + ' min à pied'; if (k < 25) return Math.round(10 + k * 3.2) + ' min en transport'; return Math.round(k * 1.1) + ' min en voiture'; }
const eur = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.00', '').replace('.', ',') + ' €';
function norm(t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function stripHtml(h) { return String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(); }
function ageText(p) { return p.a[1] >= 99 ? (p.a[0] === 0 ? 'Tous âges' : 'Dès ' + p.a[0] + ' ans') : p.a[0] + '–' + p.a[1] + ' ans'; }

function makeLogic(st) {
  const here = st.geo || PLACES[st.where] || PLACES[10];
  const km = (p) => dist(here[1], here[2], p.lat, p.lng);
  const f1Today = (p) => !!(p.f1 && firstSun(st.date) && (!p.f1.months || p.f1.months.indexOf(st.date.getMonth() + 1) >= 0));
  const eff = (p) => (f1Today(p) ? { ad: 0, en: 0 } : { ad: p.ad, en: p.en });
  const famTotal = (p) => {
    if (!st.fam) return null; const e = eff(p);
    const pay = st.fam.kids.filter((k) => !(p.free3 && k < 3)).length;
    if (e.ad == null || (pay && e.en == null)) return null;
    return st.fam.ad * e.ad + pay * (e.en || 0);
  };
  const kidCost = (p) => { const e = eff(p); return e.en != null ? e.en : e.ad; };
  const isFree = (p) => { const t = famTotal(p); if (t != null) return t === 0; return eff(p).ad === 0 && kidCost(p) === 0; };
  const priceLabel = (p) => { const t = famTotal(p); if (t != null) return t === 0 ? 'Gratuit' : '≈ ' + eur(t); const c = kidCost(p), e = eff(p); if (c === 0 && e.ad === 0) return 'Gratuit'; if (e.en === 0) return 'Gratuit enfant'; if (c == null) return 'Voir tarifs'; return 'dès ' + eur(c); };
  const shortPrice = (p) => { if (p.offer) return '−' + p.offer + ' %'; const c = kidCost(p), e = eff(p); if (c === 0 && e.ad === 0) return 'Gratuit'; if (e.en === 0) return '0 € enf.'; if (c == null) return '€'; return eur(c); };
  const ageFit = (p) => { if (!st.fam || !st.fam.kids.length) return { ok: true, all: true, miss: [] }; const miss = st.fam.kids.filter((k) => !(p.a[0] <= k && p.a[1] >= k)); return { ok: miss.length < st.fam.kids.length, all: !miss.length, miss }; };
  const hoursStatus = (p) => {
    if (key(st.date) !== key(TODAY)) return null;
    const m = /(\d{1,2})h(\d{2})?\s*–\s*(\d{1,2})h(\d{2})?/.exec(p.hours); if (!m) return null;
    const d = new Date(), n = d.getHours() * 60 + d.getMinutes(), o = +m[1] * 60 + (+m[2] || 0), c = +m[3] * 60 + (+m[4] || 0), cl = m[3] + 'h' + (m[4] || '');
    if (n < o) return { t: 'Ouvre à ' + m[1] + 'h' + (m[2] || ''), c: '#6E4D00' };
    if (n >= c) return { t: "Fermé pour aujourd'hui", c: C.accentInk, closed: true };
    if (c - n <= 60) return { t: 'Ferme bientôt (' + cl + ')', c: C.accentInk };
    return { t: "Ouvert jusqu'à " + cl, c: C.green };
  };
  const napOk = (p) => { const m = /(\d{1,2})h(\d{2})?\s*–\s*(\d{1,2})h(\d{2})?/.exec(p.hours); if (!m) return true; const o = +m[1] * 60 + (+m[2] || 0), c = +m[3] * 60 + (+m[4] || 0); return 13 * 60 - o >= 120 || c - (15 * 60 + 30) >= 120; };
  const matches = (p) => {
    if (!isOpen(p, st.date)) return false;
    if (st.q) { let q = norm(st.q.trim()); if (q.length > 3) q = q.replace(/s$/, ''); if (norm(p.name + ' ' + p.area + ' ' + p.cat + ' ' + p.io + ' ' + (p.desc || '')).indexOf(q) < 0) return false; }
    if (!ageFit(p).ok) return false;
    if (st.fam && st.fam.nap && !napOk(p)) return false;
    if (st.prefs.maxMin && tminK(km(p)) > st.prefs.maxMin) return false;
    if (st.quick.free && !isFree(p)) return false;
    if (st.quick.dry && p.io === 'Plein air') return false;
    if (st.quick.near && km(p) > 3) return false;
    if (st.quick.deal && !p.offer) return false;
    return true;
  };
  const results = st.places.filter(matches).sort((a, b) => ((hoursStatus(a) || {}).closed ? 1 : 0) - ((hoursStatus(b) || {}).closed ? 1 : 0) || (ageFit(a).all ? 0 : 1) - (ageFit(b).all ? 0 : 1) || km(a) - km(b));
  const picks = results.filter((p) => !(hoursStatus(p) || {}).closed).map((p) => ({ p, sc: -tminK(km(p)) + (ageFit(p).all ? 15 : 0) + (isFree(p) ? 8 : 0) + (p.offer ? 6 : 0) + (f1Today(p) ? 10 : 0) + (p.isNew ? 4 : 0) })).sort((a, b) => b.sc - a.sc).map((x) => x.p);
  return { here, km, f1Today, eff, famTotal, priceLabel, shortPrice, ageFit, hoursStatus, results, picks };
}
function famText(fam) {
  if (!fam) return 'Qui vient ?';
  const k = fam.kids.slice().sort((a, b) => a - b);
  return fam.ad + ' adulte' + (fam.ad > 1 ? 's' : '') + (k.length ? ' · ' + (k.length === 1 ? (k[0] ? k[0] + ' an' + (k[0] > 1 ? 's' : '') : 'bébé') : k.map((x) => x || 'bébé').join(', ').replace(/, ([^,]*)$/, ' et $1') + ' ans') : '') + (fam.nap ? ' · sieste' : '');
}
function evDates(p, date) { const a = p.ds0, b = p.de0; if (key(a) === key(b)) return fmtDay(a); return (a > date ? 'du ' + fmtDay(a) + ' ' : '') + 'jusqu’au ' + b.getDate() + ' ' + MON[b.getMonth()]; }

/* ============ Photos Wikimedia + agenda Que faire à Paris ============ */
const UA = { 'Api-User-Agent': 'OnSort/0.1 (prototype appli familles)' };
const PQ2 = {museeherbe:["Musée en Herbe","Musée en herbe Paris"],ferme:["Ferme de Paris","Ferme Georges-Ville"],daumesnil:["Lac Daumesnil barques","Lac Daumesnil"],aquarium:["Cinéaqua","Aquarium du Trocadéro"],citeenfants:["Cité des enfants","Cité des sciences Paris"],miniature:["France Miniature"],cergy:["Base de loisirs de Cergy","Étangs de Cergy"],grandpalais:["Grand Palais Paris"],philharmonie:["Philharmonie de Paris Jean Nouvel"],armee:["Musée de l'Armée"],belleville:["Parc de Belleville Paris"],floral:["Parc floral de Vincennes"],chasse:["Musée de la Chasse et de la Nature Paris"],carnavalet:["Carnavalet"],mam:["Musée d'Art moderne de la ville de Paris","Palais de Tokyo"],orsay:["Musée d'Orsay"],zoo:["Zoo de Vincennes"],evolution:["Grande galerie de l'évolution Paris"],artsmetiers:["Arts et Métiers musée Paris"],saintcloud:["Parc de Saint-Cloud"],sceaux:["Château de Sceaux"],villette:["La Villette Paris parc"],bercy:["Jardin de Bercy"],montsouris:["Parc Montsouris Paris"],citroen:["Parc André Citroën Paris"]};
const BADPH = /map|plan|carte|logo|blason|panneau|affiche|gravure|dessin|lithograph|engraving|\b1[6-8]\d\d\b|\b19[0-4]\d\b/i;
async function wmSearch(q) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=25&gsrsearch=' + encodeURIComponent(q + ' filetype:bitmap') + '&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=640&iiextmetadatafilter=Artist|LicenseShortName';
  const j = await (await fetch(u, { headers: UA })).json();
  return j && j.query && j.query.pages ? Object.values(j.query.pages).sort((a, b) => (a.index || 0) - (b.index || 0)) : [];
}
function wmPick(pages, out, seen, strict) {
  for (const pg of pages) {
    if (out.length >= 5) break; const ii = pg.imageinfo && pg.imageinfo[0]; if (!ii || seen[pg.title]) continue;
    const okMime = strict ? ii.mime === 'image/jpeg' : /image\/(jpeg|png|webp)/.test(ii.mime);
    if (!okMime || ii.width < (strict ? 1000 : 700) || (strict && ii.width < ii.height * 0.9) || BADPH.test(pg.title)) continue;
    seen[pg.title] = 1; const md = ii.extmetadata || {};
    out.push({ t: ii.thumburl || ii.url, a: stripHtml(md.Artist && md.Artist.value) || 'Auteur inconnu', l: (md.LicenseShortName && md.LicenseShortName.value) || 'Licence libre', u: ii.descriptionurl });
  }
}
async function fetchPhotos(id) {
  const qs = [PQ[id]].concat(PQ2[id] || []).filter(Boolean); if (!qs.length) return null;
  const out = [], seen = {}; let all = [];
  for (const q of qs) { if (out.length >= 4) break; try { const pages = await wmSearch(q); all = all.concat(pages); wmPick(pages, out, seen, true); } catch (e) { } }
  if (out.length < 3) wmPick(all, out, seen, false);
  return out.length ? out : null;
}
function day0(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function arrond(z) { const m = /^75(0\d\d)$/.exec(String(z || '')); if (m) { const n = +m[1].slice(1); return n === 1 ? '1er' : n + 'e'; } return String(z || ''); }
function evFromRec(r, photos) {
  const ll = r.lat_lon || r.geo_point_2d; if (!ll || !r.title) return null;
  const lat = +ll.lat, lng = +ll.lon; if (!(lat > 48.6 && lat < 49.3 && lng > 1.7 && lng < 3.0)) return null;
  const ds = r.date_start ? new Date(r.date_start) : null, de = r.date_end ? new Date(r.date_end) : ds; if (!ds || isNaN(ds)) return null;
  const aud = stripHtml((r.audience || '') + ' ' + (r.childrens || '')), am = /(\d{1,2})\s*ans/.exec(aud);
  const pt = String(r.price_type || '').toLowerCase(), free = pt.indexOf('gratuit') === 0 && pt.indexOf('condition') < 0;
  const id = 'qf-' + String(r.id || r.url || r.title).replace(/[^a-zA-Z0-9]/g, '').slice(-24);
  if (r.cover_url) photos[id] = [{ t: r.cover_url, a: stripHtml(r.cover_credit) || 'Que faire à Paris', l: 'Ville de Paris', u: r.url || 'https://quefaire.paris.fr' }];
  return { id, name: stripHtml(r.title), area: [stripHtml(r.address_name), arrond(r.address_zipcode)].filter(Boolean).join(' · ') || 'Paris', lat, lng, cat: 'Agenda', io: r.event_indoor == 1 ? 'Intérieur' : 'Mixte', a: [am ? +am[1] : 0, 99], ad: free ? 0 : null, en: free ? 0 : null, note: stripHtml(r.price_detail) || (free ? 'Gratuit' : 'Tarifs : voir le site'), days: ALL, hours: 'Horaires : voir le site', offer: 0, evt: true, ds0: day0(ds), de0: day0(de), url: r.url || '', desc: stripHtml(r.lead_text || r.description).slice(0, 260) };
}
async function fetchEvents() {
  const base = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?limit=100';
  const tries = ['&where=' + encodeURIComponent('"enfants" and date_end >= now()'), '&refine=' + encodeURIComponent('qfap_tags:Enfants'), '&where=' + encodeURIComponent('"enfants"')];
  for (const t of tries) { try { const r = await fetch(base + t); if (!r.ok) continue; const j = await r.json(); if (j.results && j.results.length) return j.results; } catch (e) { } }
  return [];
}
async function loadJSON(k, d) { try { const v = await AsyncStorage.getItem('onsort.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function saveJSON(k, v) { AsyncStorage.setItem('onsort.' + k, JSON.stringify(v)).catch(() => { }); }

/* ============ Petits composants ============ */
function Ill({ id, size }) { return ILL[id] ? <Image source={{ uri: WEB + '/ill/' + id + '.png' }} style={{ width: size, height: size }} /> : <View style={{ width: size, height: size, backgroundColor: '#FFE1EC' }} />; }
function Logo({ size }) { return <Image source={{ uri: LOGO_URI }} style={{ width: size, height: size, borderRadius: size * 0.24 }} />; }
function Thumb({ p, photos, size = 58, radius = 16 }) {
  const ph = photos[p.id] && photos[p.id][0];
  return <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: (ILL[p.id] || ['#F2F2F0'])[0] }}>{ph ? <Image source={{ uri: ph.t }} style={{ width: size, height: size }} /> : <Ill id={p.id} size={size} />}</View>;
}
function Tag({ children, bg = C.soft, fg = C.ink }) { return <View style={[s.tag, { backgroundColor: bg }]}><Text style={[s.tagT, { color: fg }]}>{children}</Text></View>; }
function CatTag({ p }) { const t = TINT[p.cat] || TINT.Château || ['#F2F2F0', '#0B0B0B']; return <Tag bg={t[0]} fg={t[1]}>{p.cat}</Tag>; }
function Chip({ on, label, onPress, hol }) { return <Pressable onPress={onPress} style={[s.chip, on && s.chipOn, hol && !on && { borderColor: '#F2B49F' }]} accessibilityRole="button" accessibilityState={{ selected: !!on }}><Text style={[s.chipT, on && { color: C.paper, fontWeight: '700' }, hol && !on && { color: C.accentInk }]}>{label}</Text></Pressable>; }
function Sheet({ visible, onClose, title, children, footer }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.dim} onPress={onClose} />
      <View style={s.panel}>
        <View style={s.panelTop}><Text style={s.panelTitle}>{title}</Text><Pressable onPress={onClose} style={s.round} accessibilityLabel="Fermer"><Text style={{ fontSize: 18, fontWeight: '700' }}>✕</Text></Pressable></View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>{children}</ScrollView>
        {footer ? <View style={s.foot}>{footer}</View> : null}
      </View>
    </Modal>
  );
}

/* ============ Appli ============ */
const QUICK = [['free', 'Gratuit'], ['dry', 'À l’abri'], ['near', 'À 20 min'], ['deal', 'Offres']];
export default function App() {
  return <Main />;
}
function Main() {
  const { width, height } = useWindowDimensions();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('explore');
  const [qIn, setQIn] = useState('');
  const [q, setQ] = useState('');
  const [date, setDate] = useState(TODAY);
  const [quick, setQuick] = useState({ free: false, dry: false, near: false, deal: false });
  const [fam, setFam] = useState(null);
  const [where, setWhere] = useState(10);
  const [geo, setGeo] = useState(null);
  const [favs, setFavs] = useState([]);
  const [me, setMe] = useState({ name: '' });
  const [prefs, setPrefs] = useState({ maxMin: null, notif: true });
  const [photos, setPhotos] = useState({});
  const [places, setPlaces] = useState(P);
  const [open, setOpen] = useState(null);
  const [sheet, setSheet] = useState(null); // 'date' | 'fam' | 'where' | 'pick'
  const [pickN, setPickN] = useState(0);
  const [full, setFull] = useState(false);
  const mapRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => setQ(qIn), 250); return () => clearTimeout(t); }, [qIn]);
  const openId = useCallback((id) => setOpen(id), []);

  useEffect(() => { (async () => {
    setFam(await loadJSON('fam', null)); setWhere(await loadJSON('where', 10)); setFavs(await loadJSON('favs', [])); setMe(await loadJSON('me', { name: '' })); setPrefs(await loadJSON('prefs', { maxMin: null, notif: true }));
    const ph = await loadJSON('ph.native.v3', {}); setPhotos(ph); setReady(true);
    try { const { status } = await Location.requestForegroundPermissionsAsync(); if (status === 'granted') { const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }); setGeo(['Ma position', pos.coords.latitude, pos.coords.longitude]); } } catch (e) { }
    const evPh = {}; const recs = await fetchEvents(); const have = {}; P.forEach((p) => { have[p.id] = 1; });
    const evs = recs.map((r) => evFromRec(r, evPh)).filter((e) => e && !have[e.id] && (have[e.id] = 1));
    if (evs.length) { setPlaces(P.concat(evs)); setPhotos((o) => ({ ...o, ...evPh })); }
    const todo = Object.keys(PQ).filter((id) => !ph[id]);
    for (let i = 0; i < todo.length; i += 6) {
      const batch = todo.slice(i, i + 6), got = {};
      await Promise.all(batch.map(async (id) => { try { const a = await fetchPhotos(id); if (a) got[id] = a; } catch (e) { } }));
      if (Object.keys(got).length) { Object.assign(ph, got); setPhotos((o) => ({ ...o, ...got })); saveJSON('ph.native.v3', ph); }
    }
  })(); }, []);

  const st = { geo, where, date, q, quick, fam, prefs, places };
  const L = useMemo(() => makeLogic(st), [geo, where, date, q, quick, fam, prefs, places]);
  const hol = holName(date), vac = vacName(date);
  const sel = open ? places.find((p) => p.id === open) : null;
  const toggleFav = (id) => { const n = favs.indexOf(id) >= 0 ? favs.filter((x) => x !== id) : favs.concat(id); setFavs(n); saveJSON('favs', n); };
  const setFamS = (f) => { setFam(f); saveJSON('fam', f); };
  const recenter = () => { const h = L.here; mapRef.current && mapRef.current.animateCamera({ center: { latitude: h[1], longitude: h[2] }, zoom: 13, heading: 0, pitch: 30 }, { duration: 600 }); };
  useEffect(() => { if (ready) recenter(); }, [geo, where, ready]);

  if (!ready) return <View style={[s.fill, { alignItems: 'center', justifyContent: 'center' }]}><Logo size={84} /><ActivityIndicator style={{ marginTop: 20 }} /></View>;

  const whenText = key(date) === key(TODAY) ? "Aujourd'hui" : key(date) === key(addDays(TODAY, 1)) ? 'Demain' : fmtDay(date) + (hol ? ' · férié' : firstSun(date) ? ' · 1er dim.' : '');
  const list = L.results;

  const rowProps = (p) => ({ p, photos: photos[p.id], width, onOpen: openId, sub: travel(L.km(p)) + (p.evt ? ' · ' + evDates(p, date) : ''), st2: L.hoursStatus(p), fit: L.ageFit(p), price: L.priceLabel(p), f1: L.f1Today(p) });

  /* ----- Explorer ----- */
  const header = (
    <View style={{ gap: 14, paddingBottom: 4 }}>
      <View style={s.search}>
        <TextInput value={qIn} onChangeText={setQIn} placeholder="On sort où ?" placeholderTextColor={C.ink} style={s.searchIn} returnKeyType="search" autoCorrect={false} />
        <Pressable style={s.go} onPress={() => { setPickN(0); setSheet('pick'); }}><Text style={s.goT}>On sort ?</Text></Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Pressable style={[s.spill, hol && { backgroundColor: '#FFE1D6' }]} onPress={() => setSheet('date')}><Text style={[s.spillT, hol && { color: C.accentInk }]}>{whenText}</Text></Pressable>
        <Pressable style={[s.spill, !fam && { backgroundColor: C.ink }]} onPress={() => setSheet('fam')}><Text style={[s.spillT, !fam && { color: C.paper }]}>{famText(fam)}</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {QUICK.map((b) => <Chip key={b[0]} label={b[1]} on={quick[b[0]]} onPress={() => setQuick({ ...quick, [b[0]]: !quick[b[0]] })} />)}
      </ScrollView>
      <View>
        <Text style={s.headline}>{(me.name ? me.name + ', ' : '') + list.length + ' sortie' + (list.length > 1 ? 's' : '') + ' pour vous'}</Text>
        <Text style={s.label}>{fmtDay(date) + (hol ? ' · ' + hol + ', jour férié' : '') + (vac ? ' · ' + vac : '') + (firstSun(date) ? ' · 1er dimanche : musées gratuits' : '') + ' · depuis ' + L.here[0]}</Text>
      </View>
      {!fam ? <Pressable style={s.nudge} onPress={() => setSheet('fam')}><Text style={{ fontWeight: '700', fontSize: 15 }}>Ajoute l’âge de tes enfants</Text><Text style={{ fontSize: 13, color: '#4A3A00' }}>On ne te montre que ce qui leur convient, avec le prix pour toute la famille.</Text></Pressable> : null}
    </View>
  );
  const empty = (
    <View style={{ alignItems: 'center', padding: 24, gap: 10 }}>
      <Text style={s.rowSub}>Rien ne correspond ce jour-là.</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {QUICK.filter((b) => quick[b[0]]).map((b) => <Chip key={b[0]} label={'Retirer « ' + b[1] + ' »'} onPress={() => setQuick({ ...quick, [b[0]]: false })} />)}
        <Chip label="Changer de jour" onPress={() => setSheet('date')} />
      </View>
    </View>
  );
  const pins = list.slice(0, 50);
  const explore = (
    <View style={s.fill}>
      <View style={{ height: full ? height * 0.78 : height * 0.4 }}>
        <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={{ latitude: L.here[1], longitude: L.here[2], latitudeDelta: 0.06, longitudeDelta: 0.06 }}
          showsUserLocation={!!geo} showsCompass rotateEnabled pitchEnabled showsPointsOfInterest={false} moveOnMarkerPress={false}>
          {!geo ? <Marker coordinate={{ latitude: L.here[1], longitude: L.here[2] }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}><View style={s.me} /></Marker> : null}
          {pins.map((p) => (
            <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} onPress={() => setOpen(p.id)} tracksViewChanges={false} anchor={{ x: 0.5, y: 1 }}>
              <View style={[s.pinPr2, { backgroundColor: p.offer ? C.accent : ((TINT[p.cat] || ['#0B0B0B'])[1]) }]}><Text style={[s.pinPrT, p.offer && { color: C.ink }]}>{L.shortPrice(p)}</Text></View>
            </Marker>
          ))}
        </MapView>
        <View style={s.topbar} pointerEvents="box-none">
          <View style={s.logo}><Logo size={26} /><Text style={s.logoT}>on sort<Text style={{ color: C.accent }}>.</Text></Text></View>
          <Pressable style={s.pill} onPress={() => setSheet('where')}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.blue }} /><Text style={s.pillT}>{L.here[0]}</Text></Pressable>
        </View>
        <Pressable style={s.recenter} onPress={recenter} accessibilityLabel="Recentrer sur mon point de départ"><Text style={{ fontSize: 20 }}>◎</Text></Pressable>
      </View>
      <View style={s.sheet}>
        <Pressable onPress={() => setFull(!full)} style={{ alignItems: 'center', paddingVertical: 8 }} accessibilityLabel={full ? 'Afficher la liste' : 'Afficher la carte en grand'}><View style={s.grab} /></Pressable>
        <FlatList data={list} keyExtractor={(p) => p.id} renderItem={({ item }) => <Row {...rowProps(item)} />}
          ListHeaderComponent={header} ListEmptyComponent={empty}
          ListFooterComponent={<Text style={[s.banner, { marginTop: 14 }]}>Version de test. Photos : Wikimedia Commons et Que faire à Paris (auteur dans chaque fiche). Tarifs et horaires indicatifs, à vérifier sur le site du lieu.</Text>}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
          initialNumToRender={5} maxToRenderPerBatch={5} windowSize={7} removeClippedSubviews />
      </View>
    </View>
  );

  /* ----- Mes sorties ----- */
  const favList = places.filter((p) => favs.indexOf(p.id) >= 0);
  const mine = (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={s.big}>Mes sorties</Text>
      <Text style={s.label}>Favoris</Text>
      {favList.length ? favList.map((p) => <Row key={p.id} {...rowProps(p)} />) : <Text style={s.rowSub}>Touche le cœur sur une sortie pour la garder ici.</Text>}
    </ScrollView>
  );

  /* ----- Compte ----- */
  const savePrefs = (n) => { setPrefs(n); saveJSON('prefs', n); };
  const wipe = () => Alert.alert('Effacer mes données ?', 'Prénom, famille, favoris et préférences seront supprimés de ce téléphone.', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Effacer', style: 'destructive', onPress: async () => { try { const ks = (await AsyncStorage.getAllKeys()).filter((k) => k.indexOf('onsort.') === 0 && k.indexOf('onsort.ph') !== 0); await AsyncStorage.multiRemove(ks); } catch (e) { } setFam(null); setFavs([]); setMe({ name: '' }); setPrefs({ maxMin: null, notif: true }); } },
  ]);
  const account = (
    <ScrollView style={{ backgroundColor: '#F4F4F1' }} contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={s.big}>Compte</Text>
      <View style={s.profCard}>
        <View style={s.avatar}><Text style={{ fontSize: 30, fontWeight: '900' }}>{(me.name || '?').charAt(0).toUpperCase()}</Text></View>
        <View style={{ flex: 1, gap: 2 }}>
          <TextInput value={me.name} onChangeText={(t) => { const n = { ...me, name: t.slice(0, 30) }; setMe(n); saveJSON('me', n); }} placeholder="Ton prénom" placeholderTextColor={C.muted} style={s.nameIn} autoComplete="given-name" />
          <Text style={s.rowSub}>{famText(fam)}</Text>
        </View>
      </View>
      <View style={s.stats}>
        <Stat n={favs.length} l="Favoris" /><View style={s.statSep} /><Stat n={fam ? fam.kids.length : 0} l="Enfants" /><View style={s.statSep} /><Stat n={L.results.length} l="Sorties dispo" />
      </View>
      <Group title="Ma famille">
        <SetRow label="Qui vient ?" value={fam ? famText(fam) : 'À compléter'} onPress={() => setSheet('fam')} />
        <SetRow label="Point de départ" value={L.here[0]} onPress={() => setSheet('where')} />
        <SetRow label="Sieste l’après-midi" sub="Masque ce qui tombe entre 13h et 15h30" right={<Switch value={!!(fam && fam.nap)} onValueChange={(v) => setFamS({ ...(fam || { ad: 2, kids: [] }), nap: v })} trackColor={{ true: C.accent }} />} last />
      </Group>
      <Group title="Préférences">
        <View style={s.gRow}><Text style={s.setT}>Distance maximum</Text></View>
        <View style={[s.seg, { marginHorizontal: 14, marginBottom: 12 }]}>
          {[[null, 'Pas de limite'], [20, '20 min'], [45, '45 min']].map((m) => <Pressable key={String(m[0])} style={[s.segB, prefs.maxMin === m[0] && s.segOn]} onPress={() => savePrefs({ ...prefs, maxMin: m[0] })}><Text style={[s.segT, prefs.maxMin === m[0] && { fontWeight: '700' }]}>{m[1]}</Text></Pressable>)}
        </View>
        <SetRow label="Idées du samedi soir" sub="Les bons plans du dimanche, la veille" right={<Switch value={!!prefs.notif} onValueChange={(v) => savePrefs({ ...prefs, notif: v })} trackColor={{ true: C.accent }} />} last />
      </Group>
      <Group title="Compte">
        <SetRow label="Se connecter avec Apple" sub="Favoris et famille sur tous tes appareils" value="Bientôt" dim />
        <SetRow label="Inviter un proche" onPress={() => Share.share({ message: 'Je trouve nos sorties en famille avec On sort : https://devbl770.github.io/on-sort/' })} last />
      </Group>
      <Group title="Aide">
        <SetRow label="Proposer une sortie" onPress={() => Share.share({ message: 'Sortie à ajouter dans On sort : ' })} />
        <SetRow label="Effacer mes données" danger onPress={wipe} last />
      </Group>
      <Text style={[s.rowSub, { textAlign: 'center', lineHeight: 18 }]}>On sort · version de test{'\n'}Agenda : Que faire à Paris (Ville de Paris) · Photos : Wikimedia Commons · Carte : Apple Plans{'\n'}Tarifs et horaires indicatifs</Text>
    </ScrollView>
  );

  /* ----- Fiche ----- */
  const fiche = sel ? (() => {
    const p = sel, a = photos[p.id], fav = favs.indexOf(p.id) >= 0, op = isOpen(p, date), st2 = L.hoursStatus(p), fit = L.ageFit(p), e = L.eff(p), ft = L.famTotal(p);
    return (
      <Modal visible animationType="slide" onRequestClose={() => setOpen(null)}>
        <SafeAreaView style={s.fill}>
          <View style={s.ovtop}>
            <Pressable style={s.round} onPress={() => setOpen(null)} accessibilityLabel="Retour"><Text style={{ fontSize: 20, fontWeight: '700' }}>‹</Text></Pressable>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={s.round} onPress={() => Share.share({ message: 'On y va ? ' + p.name + ' (' + p.area + '), ' + fmtDay(date) + '. Trouvé sur On sort.' })} accessibilityLabel="Partager"><Text style={{ fontSize: 17 }}>↗︎</Text></Pressable>
              <Pressable style={s.round} onPress={() => toggleFav(p.id)} accessibilityLabel={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}><Text style={{ fontSize: 18, color: fav ? C.accent : C.ink }}>{fav ? '♥' : '♡'}</Text></Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
            {a && a.length ? <Gallery photos={a} width={width - 32} /> : <View style={{ height: 210, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: (ILL[p.id] || ['#F2F2F0'])[0] }}><Ill id={p.id} size={210} /></View>}
            <Text style={[s.headline, { fontSize: 28 }]}>{p.name}</Text>
            <Text style={s.label}>{p.area + ' · ' + travel(L.km(p)) + ' depuis ' + L.here[0]}</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}><CatTag p={p} /><Tag>{ageText(p)}</Tag><Tag>{p.io}</Tag>{p.isNew ? <Tag bg={C.ink} fg={C.paper}>Nouveau</Tag> : null}{p.offer ? <Tag bg={C.accent}>{'−' + p.offer + ' % On sort'}</Tag> : null}</View>
            {!fit.all ? <Text style={{ color: C.accentInk, fontWeight: '600' }}>{'Pas adapté à ' + fit.miss.map((x) => (x ? x + ' ans' : 'bébé')).join(' ni à ')}</Text> : null}
            {p.desc ? <Text style={{ fontSize: 15, lineHeight: 22 }}>{p.desc}</Text> : null}
            <View style={s.facts}>
              <Fact k={p.evt ? 'Dates' : fmtDay(date)} v={p.evt ? evDates(p, date) : op ? (st2 ? st2.t : 'Ouvert · ' + p.hours) : 'Fermé ce jour-là'} vc={op ? (st2 ? st2.c : C.green) : C.accentInk} />
              {L.f1Today(p) ? <Fact k="1er dimanche du mois" v={'Gratuit pour tous' + (p.f1.resa ? ' · réservation ' + p.f1.resa : '')} vc={C.green} /> : null}
              {fam && ft != null ? <Fact k={'Pour vous (' + famText(fam) + ')'} v={ft === 0 ? 'Gratuit' : eur(ft)} /> : null}
              {!p.evt ? <Fact k="Adulte" v={e.ad == null ? 'Voir le site' : e.ad === 0 ? 'Gratuit' : eur(e.ad)} /> : null}
              {!p.evt ? <Fact k="Enfant" v={e.en == null ? 'Voir le site' : e.en === 0 ? 'Gratuit' : eur(e.en)} /> : null}
              <Fact k="À savoir" v={p.note.slice(0, 160)} last />
            </View>
            {p.url ? <Pressable onPress={() => Linking.openURL(p.url)}><Text style={{ textDecorationLine: 'underline', color: C.muted }}>Voir le programme sur Que faire à Paris</Text></Pressable> : null}
            <Text style={s.banner}>Infos de test, indicatives.</Text>
          </ScrollView>
          <View style={s.foot}>
            <Pressable style={s.cta} onPress={() => Linking.openURL(Platform.OS === 'ios' ? 'http://maps.apple.com/?daddr=' + p.lat + ',' + p.lng : 'https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lng)}><Text style={s.ctaT}>Y aller</Text></Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    );
  })() : null;

  /* ----- Fenêtres ----- */
  const sat = addDays(TODAY, (6 - TODAY.getDay() + 7) % 7 || 7), sun = addDays(TODAY, (7 - TODAY.getDay()) % 7 || 7), nh = nextHoliday();
  let dopts = [["Aujourd'hui", TODAY], ['Demain', addDays(TODAY, 1)], ['Samedi ' + sat.getDate(), sat], ['Dimanche ' + sun.getDate(), sun]];
  if (nh) dopts.push([fmtDay(nh), nh]);
  for (let i = 1; i < 60; i++) { const d = addDays(TODAY, i); if (firstSun(d)) { dopts.push([fmtDay(d) + ' · 1er dimanche', d]); break; } }
  const seen = {}; dopts = dopts.sort((a, b) => a[1] - b[1]).filter((o) => (seen[key(o[1])] ? false : (seen[key(o[1])] = 1)));
  const f = fam || { ad: 2, kids: [] };
  const pk = L.picks.length ? L.picks[pickN % L.picks.length] : null;

  return (
    <SafeAreaView style={s.fill}>
      <StatusBar barStyle="dark-content" />
      {tab === 'explore' ? explore : tab === 'favs' ? mine : account}
      <SafeAreaView style={s.tabs}>
        {[['explore', 'Explorer'], ['favs', 'Mes sorties'], ['me', 'Compte']].map((t) => (
          <Pressable key={t[0]} style={s.tabB} onPress={() => setTab(t[0])} accessibilityRole="tab" accessibilityState={{ selected: tab === t[0] }}>
            <View style={[s.tabDot, tab === t[0] && { backgroundColor: C.accent }]} /><Text style={[s.tabT, tab === t[0] && { color: C.ink }]}>{t[1]}</Text>
          </Pressable>
        ))}
      </SafeAreaView>
      {fiche}
      <Sheet visible={sheet === 'date'} onClose={() => setSheet(null)} title="Quand ?">
        {dopts.map((o) => { const hn = holName(o[1]) || vacName(o[1]); return <Pressable key={key(o[1])} style={s.setrow} onPress={() => { setDate(o[1]); setSheet(null); }}><Text style={s.setT}>{o[0]}{key(o[1]) === key(date) ? '  · choisi' : ''}</Text>{hn ? <Text style={[s.setV, { color: C.accentInk }]}>{hn}</Text> : null}</Pressable>; })}
      </Sheet>
      <Sheet visible={sheet === 'fam'} onClose={() => { if (!fam) setFamS({ ad: 2, kids: [] }); setSheet(null); }} title="Qui vient ?" footer={<Pressable style={s.cta} onPress={() => { if (!fam) setFamS({ ad: 2, kids: [] }); setSheet(null); }}><Text style={s.ctaT}>Voir les sorties</Text></Pressable>}>
        <View style={s.setrow}><Text style={s.setT}>Adultes</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><Pressable style={s.step} onPress={() => setFamS({ ...f, ad: Math.max(1, f.ad - 1) })}><Text style={{ fontSize: 20 }}>−</Text></Pressable><Text style={{ fontWeight: '700', fontSize: 17 }}>{f.ad}</Text><Pressable style={s.step} onPress={() => setFamS({ ...f, ad: Math.min(6, f.ad + 1) })}><Text style={{ fontSize: 20 }}>+</Text></Pressable></View></View>
        <Text style={s.label}>Enfants{f.kids.length ? ' · touche pour retirer' : ''}</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{f.kids.length ? f.kids.map((k, i) => <Chip key={i} on label={(k ? k + ' an' + (k > 1 ? 's' : '') : 'Bébé') + '  ✕'} onPress={() => setFamS({ ...f, kids: f.kids.filter((_, j) => j !== i) })} />) : <Text style={s.rowSub}>Aucun enfant ajouté</Text>}</View>
        <Pressable style={s.setrow} onPress={() => setFamS({ ...f, nap: !f.nap })}><View style={{ flex: 1 }}><Text style={s.setT}>Sieste l’après-midi (13h – 15h30)</Text><Text style={s.rowSub}>Ne montre que ce qui tient le matin ou en fin de journée</Text></View><Text style={[s.setV, f.nap && { color: C.green }]}>{f.nap ? 'Oui' : 'Non'}</Text></Pressable>
        <Text style={s.label}>Ajouter un enfant de…</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{Array.from({ length: 15 }, (_, a) => a).map((a) => <Chip key={a} label={a ? a + ' an' + (a > 1 ? 's' : '') : 'Bébé'} onPress={() => f.kids.length < 8 && setFamS({ ...f, kids: f.kids.concat(a) })} />)}</View>
      </Sheet>
      <Sheet visible={sheet === 'where'} onClose={() => setSheet(null)} title="Je pars de…">
        <Pressable style={s.setrow} onPress={async () => { try { const { status } = await Location.requestForegroundPermissionsAsync(); if (status === 'granted') { const pos = await Location.getCurrentPositionAsync({}); setGeo(['Ma position', pos.coords.latitude, pos.coords.longitude]); } } catch (e) { } setSheet(null); }}><Text style={s.setT}>Ma position (GPS)</Text>{geo ? <Text style={[s.setV, { color: C.blue }]}>Ici</Text> : null}</Pressable>
        {PLACES.map((pl, i) => <Pressable key={pl[0]} style={s.setrow} onPress={() => { setGeo(null); setWhere(i); saveJSON('where', i); setSheet(null); }}><Text style={s.setT}>{pl[0]}</Text>{!geo && i === where ? <Text style={[s.setV, { color: C.blue }]}>Ici</Text> : null}</Pressable>)}
      </Sheet>
      <Sheet visible={sheet === 'pick'} onClose={() => setSheet(null)} title={pk ? 'Notre idée ' + ((pickN % L.picks.length) + 1) + ' / ' + L.picks.length : 'Aucune idée'}
        footer={pk ? <View style={{ flexDirection: 'row', gap: 10 }}><Pressable style={s.ghost} onPress={() => setPickN(pickN + 1)}><Text style={{ fontWeight: '600', fontSize: 15 }}>Une autre idée</Text></Pressable><Pressable style={[s.cta, { flex: 1 }]} onPress={() => { setSheet(null); setOpen(pk.id); }}><Text style={s.ctaT}>C’est parti</Text></Pressable></View> : null}>
        {pk ? (
          <View style={{ gap: 10 }}>
            <View style={{ height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: (ILL[pk.id] || ['#F2F2F0'])[0], alignItems: 'center', justifyContent: 'center' }}>{photos[pk.id] ? <Image source={{ uri: photos[pk.id][0].t }} style={{ width: '100%', height: '100%' }} /> : <Ill id={pk.id} size={200} />}</View>
            <Text style={[s.headline, { fontSize: 26 }]}>{pk.name}</Text>
            <Text style={s.label}>{pk.area}</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Tag>{travel(L.km(pk))}</Tag>
              <Tag>{L.priceLabel(pk) === 'Gratuit' ? 'Gratuit pour vous' : L.priceLabel(pk)}</Tag>
              {fam && fam.kids.length > 1 && L.ageFit(pk).all ? <Tag>Pour tous tes enfants</Tag> : null}
              {L.f1Today(pk) ? <Tag bg="#DFF5D3" fg={C.green}>1er dimanche gratuit</Tag> : null}
              {pk.offer ? <Tag bg={C.accent}>{'−' + pk.offer + ' %'}</Tag> : null}
            </View>
          </View>
        ) : <Text style={s.rowSub}>Aucune sortie ouverte avec ces réglages.</Text>}
      </Sheet>
    </SafeAreaView>
  );
}
const Row = memo(function Row({ p, photos: a, width, onOpen, sub, st2, fit, price, f1 }) {
  return (
    <Pressable onPress={() => onOpen(p.id)} style={[s.card, st2 && st2.closed && { opacity: 0.55 }]}>
      {a && a.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.8 + 6} decelerationRate="fast" contentContainerStyle={{ gap: 6 }}>
          {a.map((ph, i) => <Pressable key={i} onPress={() => onOpen(p.id)}><Image source={{ uri: ph.t }} resizeMode="cover" style={{ width: a.length === 1 ? width - 32 : width * 0.8, height: 190, borderRadius: 16, backgroundColor: C.soft }} /></Pressable>)}
        </ScrollView>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        {!(a && a.length) ? <View style={{ width: 58, height: 58, borderRadius: 16, overflow: 'hidden', backgroundColor: (ILL[p.id] || ['#FFE1EC'])[0] }}><Ill id={p.id} size={58} /></View> : null}
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={s.rowTitle} numberOfLines={1}>{p.name}</Text>
          <Text style={s.rowSub} numberOfLines={1}>{sub}{st2 ? <Text style={{ color: st2.c, fontWeight: '600' }}>{' · ' + st2.t}</Text> : (!p.evt ? ' · ' + ageText(p) : '')}</Text>
          {p.offer ? <Text style={s.deal}>−{p.offer} % avec On sort</Text> : null}
          <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
            <CatTag p={p} />
            {f1 ? <Tag bg="#DFF5D3" fg={C.green}>Gratuit ce 1er dimanche</Tag> : null}
            {p.isNew ? <Tag bg={C.ink} fg={C.paper}>Nouveau</Tag> : null}
            {!fit.all ? <Tag>{'Pas pour ' + fit.miss.map((x) => x || 'bébé').join(', ') + (fit.miss.some((x) => x > 0) ? ' ans' : '')}</Tag> : null}
          </View>
        </View>
        <Text style={s.price}>{price}</Text>
      </View>
    </Pressable>
  );
});
function Stat({ n, l }) { return <View style={{ flex: 1, alignItems: 'center', gap: 2 }}><Text style={{ fontSize: 22, fontWeight: '900' }}>{n}</Text><Text style={s.rowSub}>{l}</Text></View>; }
function Group({ title, children }) { return <View style={{ gap: 6 }}><Text style={[s.label, { marginLeft: 14, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }]}>{title}</Text><View style={s.group}>{children}</View></View>; }
function SetRow({ label, sub, value, onPress, right, last, danger, dim }) {
  const body = (
    <View style={[s.gRow, !last && s.gLine, dim && { opacity: 0.55 }]}>
      <View style={{ flex: 1, gap: 2 }}><Text style={[s.setT, danger && { color: C.accentInk }]}>{label}</Text>{sub ? <Text style={s.rowSub}>{sub}</Text> : null}</View>
      {right || (value ? <Text style={s.setV} numberOfLines={1}>{value}</Text> : null)}
      {onPress && !right ? <Text style={{ fontSize: 20, color: '#B5B5B0', marginLeft: 6 }}>›</Text> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}
function Fact({ k, v, vc, last }) { return <View style={[s.fact, last && { borderBottomWidth: 0 }]}><Text style={{ color: C.muted, flex: 1 }}>{k}</Text><Text style={{ fontWeight: '600', color: vc || C.ink, textAlign: 'right', flex: 1 }}>{v}</Text></View>; }
function Gallery({ photos, width }) {
  const [i, setI] = useState(0);
  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 260, borderRadius: 22, overflow: 'hidden', backgroundColor: C.soft }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}>
          {photos.map((ph, j) => <Image key={j} source={{ uri: ph.t }} style={{ width, height: 260 }} />)}
        </ScrollView>
        <View style={[s.galBadge, { right: 12 }]}><Text style={s.tagT}>{(i + 1) + ' / ' + photos.length}</Text></View>
      </View>
      <Text style={{ fontSize: 11, color: C.muted }} onPress={() => Linking.openURL(photos[i].u)}>{'Photo : ' + photos[i].a + ' · ' + photos[i].l + (photos[i].l === 'Ville de Paris' ? '' : ' · Wikimedia Commons')}</Text>
    </View>
  );
}

/* ============ Styles ============ */
const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.paper },
  topbar: { position: 'absolute', top: 10, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  logo: { height: 42, paddingLeft: 8, paddingRight: 14, borderRadius: 21, backgroundColor: C.paper, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  logoT: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5, color: C.ink },
  pill: { height: 42, paddingHorizontal: 14, borderRadius: 21, backgroundColor: C.paper, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  pillT: { fontWeight: '600', fontSize: 14 },
  recenter: { position: 'absolute', right: 12, bottom: 28, width: 44, height: 44, borderRadius: 22, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8 },
  me: { width: 16, height: 16, borderRadius: 8, backgroundColor: C.blue, borderWidth: 3, borderColor: '#fff' },
  pinAv: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#fff', overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 },
  pinPr: { marginTop: -6, backgroundColor: C.ink, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1.5, borderColor: '#fff' },
  pinPrT: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sheet: { flex: 1, marginTop: -16, backgroundColor: C.paper, borderTopLeftRadius: 18, borderTopRightRadius: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18 },
  grab: { width: 36, height: 5, borderRadius: 3, backgroundColor: '#D6D6D2' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 56, borderRadius: 14, backgroundColor: C.soft, paddingLeft: 14, paddingRight: 6 },
  searchIn: { flex: 1, fontSize: 20, fontWeight: '800', color: C.ink },
  go: { height: 42, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.accent, justifyContent: 'center' },
  goT: { fontWeight: '900', fontSize: 16, color: C.ink },
  spill: { height: 40, paddingHorizontal: 13, borderRadius: 20, backgroundColor: C.soft, justifyContent: 'center' },
  spillT: { fontWeight: '600', fontSize: 14 },
  chip: { height: 36, paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: '#DADAD6', backgroundColor: C.paper, justifyContent: 'center' },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipT: { fontSize: 14, fontWeight: '500', color: C.ink },
  headline: { fontSize: 24, fontWeight: '900', letterSpacing: -0.6, color: C.ink },
  big: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  label: { fontSize: 13, fontWeight: '600', color: C.muted },
  nudge: { padding: 14, borderRadius: 16, backgroundColor: '#FFF0B8', gap: 3 },
  card: { gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 13, color: C.muted },
  deal: { fontSize: 12, fontWeight: '700', color: C.accentInk },
  price: { fontSize: 15, fontWeight: '700', textAlign: 'right', maxWidth: 110 },
  tag: { height: 22, paddingHorizontal: 7, borderRadius: 6, justifyContent: 'center' },
  tagT: { fontSize: 11, fontWeight: '700' },
  banner: { fontSize: 12, color: C.muted, backgroundColor: C.soft, borderRadius: 10, padding: 10, lineHeight: 17 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.paper },
  tabB: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabDot: { width: 6, height: 6, borderRadius: 3 },
  tabT: { fontSize: 12, fontWeight: '600', color: C.muted },
  dim: { flex: 1, backgroundColor: 'rgba(11,11,11,0.45)' },
  panel: { maxHeight: '82%', backgroundColor: C.paper, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: 20 },
  panelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  panelTitle: { fontSize: 18, fontWeight: '700' },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  foot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', gap: 10 },
  cta: { flex: 1, height: 56, borderRadius: 14, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  ctaT: { color: C.paper, fontSize: 17, fontWeight: '700' },
  ghost: { height: 56, paddingHorizontal: 18, borderRadius: 14, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  setrow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line },
  setT: { fontSize: 15, fontWeight: '600' },
  setV: { fontSize: 15, color: C.muted, textAlign: 'right', flexShrink: 1 },
  step: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#DADAD6', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  field: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#DADAD6', paddingHorizontal: 12, fontSize: 16 },
  ovtop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  facts: { borderWidth: 1, borderColor: C.line, borderRadius: 14 },
  fact: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  pinPr2: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  profCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.paper, borderRadius: 18, padding: 14 },
  nameIn: { fontSize: 20, fontWeight: '800', color: C.ink, paddingVertical: 4 },
  stats: { flexDirection: 'row', backgroundColor: C.paper, borderRadius: 18, paddingVertical: 14 },
  statSep: { width: 1, backgroundColor: C.line },
  group: { backgroundColor: C.paper, borderRadius: 16, overflow: 'hidden' },
  gRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13, minHeight: 50 },
  gLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D9D9D4' },
  seg: { flexDirection: 'row', backgroundColor: C.soft, borderRadius: 10, padding: 3 },
  segB: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: C.paper, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  segT: { fontSize: 13, color: C.ink },
  galBadge: { position: 'absolute', bottom: 12, backgroundColor: C.paper, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
});
