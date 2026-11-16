import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, 
  TextInput, ActivityIndicator, SafeAreaView, StatusBar, 
  TouchableOpacity, Modal, ScrollView, Linking 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TYPE_COLORS = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA0',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', steel: '#B7B7CE',
  fairy: '#D685AD', dark: '#705848'
};

const TYPE_BACKGROUNDS = {
  fire: { bg: '#2b0f05', card: '#4a1a08', border: '#EE8130', name: '🔥 Ateş (Fire) Teması' },
  water: { bg: '#05182b', card: '#0b2b4a', border: '#6390F0', name: '💧 Su (Water) Teması' },
  grass: { bg: '#0b2b0f', card: '#134719', border: '#7AC74C', name: '🌿 Çimen (Grass) Teması' },
  electric: { bg: '#2b2605', card: '#473f08', border: '#F7D02C', name: '⚡ Elektrik (Electric) Teması' },
  ice: { bg: '#06262b', card: '#0e4147', border: '#96D9D6', name: '❄️ Buz (Ice) Teması' },
  fighting: { bg: '#2b0a0a', card: '#471111', border: '#C22E28', name: '🥊 Dövüş (Fighting) Teması' },
  poison: { bg: '#1c072b', card: '#340e4a', border: '#A33EA0', name: '☠️ Zehir (Poison) Teması' },
  ground: { bg: '#2b210a', card: '#473611', border: '#E2BF65', name: '🌍 Toprak (Ground) Teması' },
  flying: { bg: '#17142b', card: '#2c264a', border: '#A98FF3', name: '🕊️ Uçuş (Flying) Teması' },
  psychic: { bg: '#2b0a1c', card: '#4a1130', border: '#F95587', name: '🔮 Psişik (Psychic) Teması' },
  bug: { bg: '#1b2b0a', card: '#2e4a11', border: '#A6B91A', name: '🐛 Böcek (Bug) Teması' },
  rock: { bg: '#21210a', card: '#3d3d11', border: '#B6A136', name: '🛡️ Kaya (Rock) Teması' },
  ghost: { bg: '#150a2b', card: '#25114a', border: '#735797', name: '👻 Hayalet (Ghost) Teması' },
  dragon: { bg: '#130a2b', card: '#23114a', border: '#6F35FC', name: '🐉 Ejderha (Dragon) Teması' },
  steel: { bg: '#1a1a2b', card: '#2c2c4a', border: '#B7B7CE', name: '🛡️ Çelik (Steel) Teması' },
  fairy: { bg: '#2b1422', card: '#4a233b', border: '#D685AD', name: '✨ Peri (Fairy) Teması' },
  dark: { bg: '#14100d', card: '#2b201a', border: '#705848', name: '🌑 Karanlık (Dark) Teması' },
  normal: { bg: '#1c1c18', card: '#33332c', border: '#A8A77A', name: '⭐ Normal Tema' }
};

const THEMES = {
  neon: { bg: '#090614', card: 'rgba(255, 255, 255, 0.08)', name: '🌌 Koyu Neon (Varsayılan)' },
  oled: { bg: '#000000', card: '#121212', name: '🌑 Saf Siyah (OLED)' },
  dragon: { bg: '#160926', card: 'rgba(111, 53, 252, 0.15)', name: '🐉 Ejderha Moru' },
  forest: { bg: '#061c10', card: 'rgba(122, 199, 76, 0.12)', name: '🌿 Orman Yeşili' },
  ...TYPE_BACKGROUNDS
};

const TYPE_RELATIONS = {
  fire: { weakTo: ['water', 'ground', 'rock'], strongAgainst: ['grass', 'ice', 'bug', 'steel'], multiplier2x: ['water', 'ground', 'rock'], multiplier05: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'] },
  water: { weakTo: ['electric', 'grass'], strongAgainst: ['fire', 'ground', 'rock'], multiplier2x: ['electric', 'grass'], multiplier05: ['fire', 'water', 'ice', 'steel'] },
  grass: { weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'], strongAgainst: ['water', 'ground', 'rock'], multiplier2x: ['fire', 'ice', 'poison', 'flying', 'bug'], multiplier05: ['water', 'electric', 'grass', 'ground'] },
  electric: { weakTo: ['ground'], strongAgainst: ['water', 'flying'], multiplier2x: ['ground'], multiplier05: ['electric', 'flying', 'steel'] },
  normal: { weakTo: ['fighting'], strongAgainst: [], multiplier2x: ['fighting'], multiplier05: [] },
  ice: { weakTo: ['fire', 'fighting', 'rock', 'steel'], strongAgainst: ['grass', 'ground', 'flying', 'dragon'], multiplier2x: ['fire', 'fighting', 'rock', 'steel'], multiplier05: ['ice'] },
  fighting: { weakTo: ['flying', 'psychic', 'fairy'], strongAgainst: ['normal', 'ice', 'rock', 'dark', 'steel'], multiplier2x: ['flying', 'psychic', 'fairy'], multiplier05: ['bug', 'rock', 'dark'] },
  poison: { weakTo: ['ground', 'psychic'], strongAgainst: ['grass', 'fairy'], multiplier2x: ['ground', 'psychic'], multiplier05: ['grass', 'fighting', 'poison', 'bug', 'fairy'] },
  ground: { weakTo: ['water', 'grass', 'ice'], strongAgainst: ['fire', 'electric', 'poison', 'rock', 'steel'], multiplier2x: ['water', 'grass', 'ice'], multiplier05: ['poison', 'rock'] },
  flying: { weakTo: ['electric', 'ice', 'rock'], strongAgainst: ['grass', 'fighting', 'bug'], multiplier2x: ['electric', 'ice', 'rock'], multiplier05: ['grass', 'fighting', 'bug'] },
  psychic: { weakTo: ['bug', 'ghost', 'dark'], strongAgainst: ['fighting', 'poison'], multiplier2x: ['bug', 'ghost', 'dark'], multiplier05: ['fighting', 'psychic'] },
  bug: { weakTo: ['fire', 'flying', 'rock'], strongAgainst: ['grass', 'psychic', 'dark'], multiplier2x: ['fire', 'flying', 'rock'], multiplier05: ['grass', 'fighting', 'ground'] },
  rock: { weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'], strongAgainst: ['fire', 'ice', 'flying', 'bug'], multiplier2x: ['water', 'grass', 'fighting', 'ground', 'steel'], multiplier05: ['normal', 'fire', 'poison', 'flying'] },
  ghost: { weakTo: ['ghost', 'dark'], strongAgainst: ['psychic', 'ghost'], multiplier2x: ['ghost', 'dark'], multiplier05: ['poison', 'bug'] },
  dragon: { weakTo: ['ice', 'dragon', 'fairy'], strongAgainst: ['dragon'], multiplier2x: ['ice', 'dragon', 'fairy'], multiplier05: ['fire', 'water', 'grass', 'electric'] },
  steel: { weakTo: ['fire', 'fighting', 'ground'], strongAgainst: ['ice', 'rock', 'fairy'], multiplier2x: ['fire', 'fighting', 'ground'], multiplier05: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'] },
  fairy: { weakTo: ['poison', 'steel'], strongAgainst: ['fighting', 'dragon', 'dark'], multiplier2x: ['poison', 'steel'], multiplier05: ['fighting', 'bug', 'dark'] },
  dark: { weakTo: ['fighting', 'bug', 'fairy'], strongAgainst: ['psychic', 'ghost'], multiplier2x: ['fighting', 'bug', 'fairy'], multiplier05: ['ghost', 'dark'] }
};

const MOVE_TRANSLATIONS = {
  'tackle': 'Bodur Vuruş (Tackle)', 'ember': 'Köz (Ember)', 'scratch': 'Tırmık (Scratch)',
  'vine-whip': 'Asma Kamçısı (Vine Whip)', 'water-gun': 'Su Tabancası (Water Gun)',
  'thunder-shock': 'Şok (Thunder Shock)', 'quick-attack': 'Hızlı Saldırı (Quick Attack)',
  'flamethrower': 'Alev Makinesi (Flamethrower)', 'hydro-pump': 'Hidro Pompa (Hidro Pompa)'
};

const translateMoveName = (moveSlug) => MOVE_TRANSLATIONS[moveSlug] || moveSlug.replace(/-/g, ' ').toUpperCase();

const GENERATIONS = [
  { label: 'Tümü (1-1025)', start: 1, end: 1025 },
  { label: 'Kanto (1-151)', start: 1, end: 151 },
  { label: 'Johto (152-251)', start: 152, end: 251 },
  { label: 'Hoenn (252-386)', start: 252, end: 386 },
  { label: 'Sinnoh (387-493)', start: 387, end: 493 },
  { label: 'Unova (494-649)', start: 494, end: 649 },
  { label: 'Kalos (650-721)', start: 650, end: 721 },
  { label: 'Alola (722-809)', start: 722, end: 809 },
  { label: 'Galar (810-905)', start: 810, end: 905 },
  { label: 'Paldea (906-1025)', start: 906, end: 1025 }
];

const POKEMON_SERIES_LIST = [
  { title: 'Pokémon (SezonlukDizi Arşivi)', url: 'https://sezonlukdizi.cc/diziler.asp?adi=pokemon' }
];

const FORM_MAPPINGS = {
  3: { mega: 'venusaur-mega', name: 'Mega Venusaur' },
  6: { mega: 'charizard-mega-x', gmax: 'charizard-gmax', name: 'Mega/G-Max Charizard' },
  9: { mega: 'blastoise-mega', gmax: 'blastoise-gmax', name: 'Mega/G-Max Blastoise' },
  25: { gmax: 'pikachu-gmax', name: 'G-Max Pikachu' },
  94: { mega: 'gengar-mega', gmax: 'gengar-gmax', name: 'Mega/G-Max Gengar' }
};

const LEGENDARY_IDS = [144, 145, 146, 150, 243, 244, 245, 249, 250, 380, 381, 382, 383, 384];

// EKSİKSİZ TÜM MEGA EVRİMLER LİSTESİ
const MEGA_POKEMON_LIST = [
  { id: 10039, name: 'venusaur-mega', displayName: 'Mega Venusaur' },
  { id: 10040, name: 'charizard-mega-x', displayName: 'Mega Charizard X' },
  { id: 10041, name: 'charizard-mega-y', displayName: 'Mega Charizard Y' },
  { id: 10042, name: 'blastoise-mega', displayName: 'Mega Blastoise' },
  { id: 10043, name: 'beedrill-mega', displayName: 'Mega Beedrill' },
  { id: 10044, name: 'pidgeot-mega', displayName: 'Mega Pidgeot' },
  { id: 10045, name: 'alakazam-mega', displayName: 'Mega Alakazam' },
  { id: 10046, name: 'slowbro-mega', displayName: 'Mega Slowbro' },
  { id: 10047, name: 'gengar-mega', displayName: 'Mega Gengar' },
  { id: 10048, name: 'kangaskhan-mega', displayName: 'Mega Kangaskhan' },
  { id: 10049, name: 'pinsir-mega', displayName: 'Mega Pinsir' },
  { id: 10050, name: 'gyarados-mega', displayName: 'Mega Gyarados' },
  { id: 10051, name: 'aerodactyl-mega', displayName: 'Mega Aerodactyl' },
  { id: 10052, name: 'mewtwo-mega-x', displayName: 'Mega Mewtwo X' },
  { id: 10053, name: 'mewtwo-mega-y', displayName: 'Mega Mewtwo Y' },
  { id: 10054, name: 'ampharos-mega', displayName: 'Mega Ampharos' },
  { id: 10055, name: 'steelix-mega', displayName: 'Mega Steelix' },
  { id: 10056, name: 'scizor-mega', displayName: 'Mega Scizor' },
  { id: 10057, name: 'heracross-mega', displayName: 'Mega Heracross' },
  { id: 10058, name: 'houndoom-mega', displayName: 'Mega Houndoom' },
  { id: 10059, name: 'tyranitar-mega', displayName: 'Mega Tyranitar' },
  { id: 10060, name: 'blaziken-mega', displayName: 'Mega Blaziken' },
  { id: 10061, name: 'gardevoir-mega', displayName: 'Mega Gardevoir' },
  { id: 10062, name: 'mawile-mega', displayName: 'Mega Mawile' },
  { id: 10063, name: 'aggron-mega', displayName: 'Mega Aggron' },
  { id: 10064, name: 'medicham-mega', displayName: 'Mega Medicham' },
  { id: 10065, name: 'manectric-mega', displayName: 'Mega Manectric' },
  { id: 10066, name: 'banette-mega', displayName: 'Mega Banette' },
  { id: 10067, name: 'absol-mega', displayName: 'Mega Absol' },
  { id: 10068, name: 'garchomp-mega', displayName: 'Mega Garchomp' },
  { id: 10069, name: 'lucario-mega', displayName: 'Mega Lucario' },
  { id: 10070, name: 'abomasnow-mega', displayName: 'Mega Abomasnow' },
  { id: 10071, name: 'florges-eternal', displayName: 'Eternal Flower Florges' },
  { id: 10072, name: 'pinsir-mega', displayName: 'Mega Pinsir' },
  { id: 10075, name: 'latias-mega', displayName: 'Mega Latias' },
  { id: 10076, name: 'latios-mega', displayName: 'Mega Latios' },
  { id: 10077, name: 'swampert-mega', displayName: 'Mega Swampert' },
  { id: 10078, name: 'sceptile-mega', displayName: 'Mega Sceptile' },
  { id: 10079, name: 'sableye-mega', displayName: 'Mega Sableye' },
  { id: 10080, name: 'altaria-mega', displayName: 'Mega Altaria' },
  { id: 10081, name: 'gallade-mega', displayName: 'Mega Gallade' },
  { id: 10082, name: 'audino-mega', displayName: 'Mega Audino' },
  { id: 10083, name: 'sharpedo-mega', displayName: 'Mega Sharpedo' },
  { id: 10084, name: 'slowbro-mega', displayName: 'Mega Slowbro' },
  { id: 10085, name: 'steelix-mega', displayName: 'Mega Steelix' },
  { id: 10086, name: 'pidgeot-mega', displayName: 'Mega Pidgeot' },
  { id: 10087, name: 'glalie-mega', displayName: 'Mega Glalie' },
  { id: 10088, name: 'diancie-mega', displayName: 'Mega Diancie' },
  { id: 10089, name: 'metagross-mega', displayName: 'Mega Metagross' },
  { id: 10090, name: 'kyogre-primal', displayName: 'Primal Kyogre' },
  { id: 10091, name: 'groudon-primal', displayName: 'Primal Groudon' },
  { id: 10092, name: 'rayquaza-mega', displayName: 'Mega Rayquaza' }
];

// EKSİKSİZ TÜM GİGANTAMAX (G-MAX) LİSTESİ
const GMAX_POKEMON_LIST = [
  { id: 10195, name: 'venusaur-gmax', displayName: 'G-Max Venusaur' },
  { id: 10196, name: 'charizard-gmax', displayName: 'G-Max Charizard' },
  { id: 10197, name: 'blastoise-gmax', displayName: 'G-Max Blastoise' },
  { id: 10198, name: 'butterfree-gmax', displayName: 'G-Max Butterfree' },
  { id: 10199, name: 'pikachu-gmax', displayName: 'G-Max Pikachu' },
  { id: 10200, name: 'meowth-gmax', displayName: 'G-Max Meowth' },
  { id: 10201, name: 'machamp-gmax', displayName: 'G-Max Machamp' },
  { id: 10202, name: 'gengar-gmax', displayName: 'G-Max Gengar' },
  { id: 10203, name: 'kingler-gmax', displayName: 'G-Max Kingler' },
  { id: 10204, name: 'lapras-gmax', displayName: 'G-Max Lapras' },
  { id: 10205, name: 'eevee-gmax', displayName: 'G-Max Eevee' },
  { id: 10206, name: 'snorlax-gmax', displayName: 'G-Max Snorlax' },
  { id: 10207, name: 'garbodor-gmax', displayName: 'G-Max Garbodor' },
  { id: 10208, name: 'melmetal-gmax', displayName: 'G-Max Melmetal' },
  { id: 10209, name: 'rillaboom-gmax', displayName: 'G-Max Rillaboom' },
  { id: 10210, name: 'cinderace-gmax', displayName: 'G-Max Cinderace' },
  { id: 10211, name: 'inteleon-gmax', displayName: 'G-Max Inteleon' },
  { id: 10212, name: 'corviknight-gmax', displayName: 'G-Max Corviknight' },
  { id: 10213, name: 'orbeetle-gmax', displayName: 'G-Max Orbeetle' },
  { id: 10214, name: 'drednaw-gmax', displayName: 'G-Max Drednaw' },
  { id: 10215, name: 'coalossal-gmax', displayName: 'G-Max Coalossal' },
  { id: 10216, name: 'flapple-gmax', displayName: 'G-Max Flapple' },
  { id: 10217, name: 'appletun-gmax', displayName: 'G-Max Appletun' },
  { id: 10218, name: 'sandaconda-gmax', displayName: 'G-Max Sandaconda' },
  { id: 10219, name: 'toxtricity-amped-gmax', displayName: 'G-Max Toxtricity' },
  { id: 10220, name: 'centiskorch-gmax', displayName: 'G-Max Centiskorch' },
  { id: 10221, name: 'hatterene-gmax', displayName: 'G-Max Hatterene' },
  { id: 10222, name: 'grimmsnarl-gmax', displayName: 'G-Max Grimmsnarl' },
  { id: 10223, name: 'alcremie-gmax', displayName: 'G-Max Alcremie' },
  { id: 10224, name: 'copperajah-gmax', displayName: 'G-Max Copperajah' },
  { id: 10225, name: 'duraludon-gmax', displayName: 'G-Max Duraludon' },
  { id: 10226, name: 'urshifu-single-strike-gmax', displayName: 'G-Max Urshifu (Single)' },
  { id: 10227, name: 'urshifu-rapid-strike-gmax', displayName: 'G-Max Urshifu (Rapid)' }
];

// EKSİKSİZ TÜM BÖLGESEL FORMLAR (Hisui, Paldea, Alola, Galar)
const REGIONAL_POKEMON_LIST = [
  // Alola Formları
  { id: 10103, name: 'vulpix-alola', displayName: 'Alolan Vulpix', region: 'alola' },
  { id: 10104, name: 'ninetales-alola', displayName: 'Alolan Ninetales', region: 'alola' },
  { id: 10105, name: 'diglett-alola', displayName: 'Alolan Diglett', region: 'alola' },
  { id: 10106, name: 'dugtrio-alola', displayName: 'Alolan Dugtrio', region: 'alola' },
  { id: 10107, name: 'meowth-alola', displayName: 'Alolan Meowth', region: 'alola' },
  { id: 10108, name: 'persian-alola', displayName: 'Alolan Persian', region: 'alola' },
  { id: 10109, name: 'geodude-alola', displayName: 'Alolan Geodude', region: 'alola' },
  { id: 10110, name: 'graveler-alola', displayName: 'Alolan Graveler', region: 'alola' },
  { id: 10111, name: 'golem-alola', displayName: 'Alolan Golem', region: 'alola' },
  { id: 10112, name: 'grimer-alola', displayName: 'Alolan Grimer', region: 'alola' },
  { id: 10113, name: 'muk-alola', displayName: 'Alolan Muk', region: 'alola' },
  { id: 10114, name: 'exeggutor-alola', displayName: 'Alolan Exeggutor', region: 'alola' },
  { id: 10115, name: 'marowak-alola', displayName: 'Alolan Marowak', region: 'alola' },

  // Galar Formları
  { id: 10161, name: 'meowth-galar', displayName: 'Galarian Meowth', region: 'galar' },
  { id: 10162, name: 'ponyta-galar', displayName: 'Galarian Ponyta', region: 'galar' },
  { id: 10163, name: 'rapidash-galar', displayName: 'Galarian Rapidash', region: 'galar' },
  { id: 10164, name: 'slowpoke-galar', displayName: 'Galarian Slowpoke', region: 'galar' },
  { id: 10165, name: 'slowbro-galar', displayName: 'Galarian Slowbro', region: 'galar' },
  { id: 10166, name: 'farfetchd-galar', displayName: 'Galarian Farfetchd', region: 'galar' },
  { id: 10167, name: 'weezing-galar', displayName: 'Galarian Weezing', region: 'galar' },
  { id: 10168, name: 'mr-mime-galar', displayName: 'Galarian Mr. Mime', region: 'galar' },
  { id: 10169, name: 'articuno-galar', displayName: 'Galarian Articuno', region: 'galar' },
  { id: 10170, name: 'zapdos-galar', displayName: 'Galarian Zapdos', region: 'galar' },
  { id: 10171, name: 'moltres-galar', displayName: 'Galarian Moltres', region: 'galar' },
  { id: 10172, name: 'slowking-galar', displayName: 'Galarian Slowking', region: 'galar' },
  { id: 10173, name: 'corsola-galar', displayName: 'Galarian Corsola', region: 'galar' },
  { id: 10174, name: 'zigzagoon-galar', displayName: 'Galarian Zigzagoon', region: 'galar' },
  { id: 10175, name: 'linoone-galar', displayName: 'Galarian Linoone', region: 'galar' },
  { id: 10176, name: 'darumaka-galar', displayName: 'Galarian Darumaka', region: 'galar' },
  { id: 10177, name: 'darmanitan-galar', displayName: 'Galarian Darmanitan', region: 'galar' },
  { id: 10178, name: 'yamask-galar', displayName: 'Galarian Yamask', region: 'galar' },
  { id: 10179, name: 'stunfisk-galar', displayName: 'Galarian Stunfisk', region: 'galar' },

  // Hisui Formları
  { id: 10230, name: 'growlithe-hisui', displayName: 'Hisuian Growlithe', region: 'hisui' },
  { id: 10231, name: 'arcanine-hisui', displayName: 'Hisuian Arcanine', region: 'hisui' },
  { id: 10232, name: 'voltorb-hisui', displayName: 'Hisuian Voltorb', region: 'hisui' },
  { id: 10233, name: 'electrode-hisui', displayName: 'Hisuian Electrode', region: 'hisui' },
  { id: 10234, name: 'typhlosion-hisui', displayName: 'Hisuian Typhlosion', region: 'hisui' },
  { id: 10235, name: 'qwilfish-hisui', displayName: 'Hisuian Qwilfish', region: 'hisui' },
  { id: 10236, name: 'sneasel-hisui', displayName: 'Hisuian Sneasel', region: 'hisui' },
  { id: 10237, name: 'samurott-hisui', displayName: 'Hisuian Samurott', region: 'hisui' },
  { id: 10238, name: 'lilligant-hisui', displayName: 'Hisuian Lilligant', region: 'hisui' },
  { id: 10239, name: 'zorua-hisui', displayName: 'Hisuian Zorua', region: 'hisui' },
  { id: 10240, name: 'zoroark-hisui', displayName: 'Hisuian Zoroark', region: 'hisui' },
  { id: 10241, name: 'braviary-hisui', displayName: 'Hisuian Braviary', region: 'hisui' },
  { id: 10242, name: 'sliggoo-hisui', displayName: 'Hisuian Sliggoo', region: 'hisui' },
  { id: 10243, name: 'goodra-hisui', displayName: 'Hisuian Goodra', region: 'hisui' },
  { id: 10244, name: 'avalugg-hisui', displayName: 'Hisuian Avalugg', region: 'hisui' },
  { id: 10245, name: 'decidueye-hisui', displayName: 'Hisuian Decidueye', region: 'hisui' },

  // Paldea Formları
  { id: 10252, name: 'wooper-paldea', displayName: 'Paldean Wooper', region: 'paldea' },
  { id: 10253, name: 'tauros-paldea-combat-breed', displayName: 'Paldean Tauros (Combat)', region: 'paldea' },
  { id: 10254, name: 'tauros-paldea-blaze-breed', displayName: 'Paldean Tauros (Blaze)', region: 'paldea' },
  { id: 10255, name: 'tauros-paldea-aqua-breed', displayName: 'Paldean Tauros (Aqua)', region: 'paldea' }
];

const translateToTurkish = async (text) => {
  if (!text) return '';
  try {
    const cleanText = text.replace(/[\n\f]/g, ' ').replace(/-/g, ' ');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return cleanText;
  } catch (error) {
    return text.replace(/-/g, ' ');
  }
};

export default function App() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [displayedPokemon, setDisplayedPokemon] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState(GENERATIONS[0]);
  
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isShiny, setIsShiny] = useState(false);
  const [currentFormType, setCurrentFormType] = useState('default');
  
  const [typeInfoModalVisible, setTypeInfoModalVisible] = useState(false);
  const [selectedTypeInfo, setSelectedTypeInfo] = useState(null);
  const [typePokemonList, setTypePokemonList] = useState([]);
  const [typeInfoLoading, setTypeInfoLoading] = useState(false);

  const [animeModalVisible, setAnimeModalVisible] = useState(false);
  const [dailyPokemon, setDailyPokemon] = useState(null);
  const [dailyModalVisible, setDailyModalVisible] = useState(false);

  const [gameMenuVisible, setGameMenuVisible] = useState(false);
  const [whoModalVisible, setWhoModalVisible] = useState(false);
  const [whoData, setWhoData] = useState(null);
  const [whoScore, setWhoScore] = useState(0);
  const [whoMsg, setWhoMsg] = useState('');

  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizMsg, setQuizMsg] = useState('');

  const [arenaModalVisible, setArenaModalVisible] = useState(false);
  const [arenaTarget, setArenaTarget] = useState(null);
  const [arenaScore, setArenaScore] = useState(0);
  const [arenaMsg, setArenaMsg] = useState('');

  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [userName, setUserName] = useState('Aren');
  const [currentThemeKey, setCurrentThemeKey] = useState('neon');
  const [activeFilterTitle, setActiveFilterTitle] = useState('');

  useEffect(() => {
    loadUserData();
    fetchAllPokemonMeta();
  }, []);

  const loadUserData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('@user_name');
      if (savedName) setUserName(savedName);
      const savedTheme = await AsyncStorage.getItem('@user_theme_key');
      if (savedTheme && THEMES[savedTheme]) setCurrentThemeKey(savedTheme);
    } catch (e) {}
  };

  const changeTheme = async (themeKey) => {
    setCurrentThemeKey(themeKey);
    await AsyncStorage.setItem('@user_theme_key', themeKey);
  };

  const fetchAllPokemonMeta = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
      const data = await response.json();
      
      const formattedData = data.results.map((item, index) => {
        const id = index + 1;
        return {
          id: id,
          name: item.name,
          displayName: item.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        };
      });

      setAllPokemon(formattedData);
      filterPokemonByGen(GENERATIONS[0], formattedData);
      setLoading(false);
      checkAndLoadDailyPokemon(formattedData.length || 1025);
    } catch (error) {
      setLoading(false);
    }
  };

  const checkAndLoadDailyPokemon = async (totalCount) => {
    try {
      const now = new Date();
      const todayString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const savedDate = await AsyncStorage.getItem('@daily_pokemon_date');
      const savedPokemonStr = await AsyncStorage.getItem('@daily_pokemon_data');
      if (savedDate === todayString && savedPokemonStr) {
        setDailyPokemon(JSON.parse(savedPokemonStr));
        return;
      }
      const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
      const dailyId = (dateSeed % totalCount) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${dailyId}`);
      const data = await res.json();
      let trBio = 'Açıklama getiriliyor...';
      let genderText = 'Erkek: %50 | Dişi: %50';

      if (data.species?.url) {
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();
        const flavorEntry = speciesData.flavor_text_entries?.find(e => e.language.name === 'en');
        if (flavorEntry) trBio = await translateToTurkish(flavorEntry.flavor_text);
        const rate = speciesData.gender_rate;
        if (rate === -1) genderText = 'Cinsiyetsiz';
        else if (rate === 0) genderText = 'Erkek: %100';
        else if (rate === 8) genderText = 'Dişi: %100';
        else genderText = `Erkek: %${100 - (rate / 8) * 100} | Dişi: %${(rate / 8) * 100}`;
      }
      const primaryType = data.types?.[0]?.type?.name || 'normal';
      const newDaily = {
        id: data.id,
        name: data.name,
        image: data.sprites?.other?.['official-artwork']?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
        bio: trBio,
        gender: genderText,
        mainType: primaryType,
        mainColor: TYPE_COLORS[primaryType] || '#3657a8'
      };
      await AsyncStorage.setItem('@daily_pokemon_date', todayString);
      await AsyncStorage.setItem('@daily_pokemon_data', JSON.stringify(newDaily));
      setDailyPokemon(newDaily);
    } catch (e) {}
  };

  const filterPokemonByGen = (gen, sourceList = allPokemon) => {
    setSelectedGen(gen);
    setActiveFilterTitle('');
    setSearch('');
    const filtered = sourceList.filter(p => p.id >= gen.start && p.id <= gen.end);
    setDisplayedPokemon(filtered);
  };

  const handleSearch = (text) => {
    setSearch(text);
    setActiveFilterTitle('');
    if (text === '') {
      filterPokemonByGen(selectedGen);
    } else {
      const filtered = allPokemon.filter(p => 
        (p.name.toLowerCase().includes(text.toLowerCase()) || String(p.id) === text)
      );
      setDisplayedPokemon(filtered);
    }
  };

  const loadSpecialList = async (listData, title) => {
    setMenuVisible(false);
    setSearch('');
    setActiveFilterTitle(title);
    setLoading(true);

    try {
      const detailedList = await Promise.all(
        listData.map(async (item) => {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${item.name}`);
            const data = await res.json();
            return {
              id: item.id,
              name: item.name,
              displayName: item.displayName,
              image: data.sprites?.other?.['official-artwork']?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`
            };
          } catch (err) {
            return {
              id: item.id, name: item.name, displayName: item.displayName,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`
            };
          }
        })
      );
      setDisplayedPokemon(detailedList);
      setLoading(false);
    } catch (e) { setLoading(false); }
  };

  const startWhoIsThatPokemon = async () => {
    setGameMenuVisible(false);
    setWhoMsg('');
    setWhoModalVisible(true);
    try {
      const randomId = Math.floor(Math.random() * 350) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await res.json();
      const correctName = data.name;
      let options = [correctName];
      while (options.length < 3) {
        const wrongId = Math.floor(Math.random() * 350) + 1;
        if (wrongId !== randomId) {
          const wrongRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${wrongId}`);
          const wrongData = await wrongRes.json();
          if (!options.includes(wrongData.name)) options.push(wrongData.name);
        }
      }
      options.sort(() => Math.random() - 0.5);
      setWhoData({ name: correctName, image: data.sprites?.other?.['official-artwork']?.front_default, options });
    } catch (e) {}
  };

  const handleWhoGuess = (guessed) => {
    if (guessed === whoData.name) {
      setWhoScore(prev => prev + 10);
      setWhoMsg('🎉 Tebrikler! Doğru İsim (+10 Puan)');
    } else {
      setWhoMsg(`❌ Yanlış! Doğru İsim: ${whoData.name.toUpperCase()}`);
    }
    setTimeout(() => startWhoIsThatPokemon(), 1600);
  };

  const startTypeQuiz = () => {
    setGameMenuVisible(false);
    setQuizMsg('');
    setQuizModalVisible(true);
    const keys = Object.keys(TYPE_RELATIONS);
    const randomType = keys[Math.floor(Math.random() * keys.length)];
    const correctList = TYPE_RELATIONS[randomType].weakTo;
    if (!correctList || correctList.length === 0) {
      startTypeQuiz();
      return;
    }
    const correctAns = correctList[Math.floor(Math.random() * correctList.length)];
    let options = [correctAns];
    while (options.length < 3) {
      const wrong = keys[Math.floor(Math.random() * keys.length)];
      if (!correctList.includes(wrong) && !options.includes(wrong)) options.push(wrong);
    }
    options.sort(() => Math.random() - 0.5);
    setQuizData({ targetType: randomType, correctAnswer: correctAns, options });
  };

  const handleQuizGuess = (guessed) => {
    if (guessed === quizData.correctAnswer) {
      setQuizScore(prev => prev + 15);
      setQuizMsg('🎉 Harika! Doğru Zayıflık Türü (+15 Puan)');
    } else {
      setQuizMsg(`❌ Yanlış! Doğru cevap: ${quizData.correctAnswer.toUpperCase()}`);
    }
    setTimeout(() => startTypeQuiz(), 1600);
  };

  const startArenaGame = () => {
    setGameMenuVisible(false);
    setArenaMsg('');
    setArenaModalVisible(true);
    generateNewArenaTarget();
  };

  const generateNewArenaTarget = () => {
    const types = Object.keys(TYPE_RELATIONS);
    const targetType = types[Math.floor(Math.random() * types.length)];
    const correctWeaknesses = TYPE_RELATIONS[targetType].weakTo;
    
    let options = [];
    if (correctWeaknesses && correctWeaknesses.length > 0) {
      options.push(correctWeaknesses[Math.floor(Math.random() * correctWeaknesses.length)]);
    } else {
      options.push('water');
    }

    while (options.length < 4) {
      const rnd = types[Math.floor(Math.random() * types.length)];
      if (!options.includes(rnd) && (!correctWeaknesses || !correctWeaknesses.includes(rnd))) {
        options.push(rnd);
      }
    }
    options.sort(() => Math.random() - 0.5);

    setArenaTarget({
      defendingType: targetType,
      correctAnswers: correctWeaknesses || [],
      options
    });
  };

  const handleArenaAttack = (selectedType) => {
    const isSuperEffective = arenaTarget.correctAnswers.includes(selectedType);
    if (isSuperEffective) {
      setArenaScore(prev => prev + 25);
      setArenaMsg(`🔥 SÜPER ETKİLİ VURUŞ! (+25 Puan)`);
    } else {
      setArenaMsg(`🛡️ Etkisiz Vuruş... Rakip direnç gösterdi.`);
    }
    setTimeout(() => {
      setArenaMsg('');
      generateNewArenaTarget();
    }, 1400);
  };

  const openTypeInfoModal = async (typeName) => {
    setSelectedTypeInfo(typeName);
    setTypeInfoModalVisible(true);
    setTypeInfoLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
      const data = await res.json();
      const first15 = data.pokemon.slice(0, 15);
      const list = first15.map(p => ({ name: p.pokemon.name, url: p.pokemon.url }));
      setTypePokemonList(list);
      setTypeInfoLoading(false);
    } catch (e) { setTypeInfoLoading(false); }
  };

  const openPokemonDetail = async (pokemonItem, customSlug = null, formType = 'default') => {
    setModalVisible(true);
    setDetailLoading(true);
    setIsShiny(false);
    setCurrentFormType(formType);
    
    try {
      const targetSlug = customSlug || pokemonItem.name || pokemonItem.id;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${targetSlug}`);
      const data = await res.json();
      let trBio = 'Açıklama yükleniyor...';
      let genderText = 'Erkek: %50 | Dişi: %50';
      let evoChainArray = [];
      let levelMovesList = [];

      try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id < 10000 ? data.id : 1}`);
        const speciesData = await speciesRes.json();
        
        if (speciesData.flavor_text_entries) {
          const flavorEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
          if (flavorEntry) trBio = await translateToTurkish(flavorEntry.flavor_text);
        }

        if (speciesData.evolution_chain?.url) {
          const evoRes = await fetch(speciesData.evolution_chain.url);
          const evoData = await evoRes.json();
          let current = evoData.chain;
          
          while (current) {
            const speciesName = current.species.name;
            const speciesIdMatch = current.species.url.match(/\/v2\/pokemon-species\/(\d+)\//);
            const sId = speciesIdMatch ? speciesIdMatch[1] : 1;
            
            evoChainArray.push({
              name: speciesName,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${sId}.png`
            });
            current = current.evolves_to[0];
          }
        }
      } catch (err) {}

      const versionGroups = data.moves.flatMap(m => m.version_group_details.map(v => v.version_group.name));
      const uniqueVersions = Array.from(new Set(versionGroups));
      let bestVersion = uniqueVersions.includes('scarlet-violet') ? 'scarlet-violet' : (uniqueVersions[uniqueVersions.length - 1] || 'scarlet-violet');

      const targetedMoves = data.moves.filter(m => 
        m.version_group_details.some(v => v.version_group.name === bestVersion && v.move_learn_method.name === 'level-up')
      );

      levelMovesList = targetedMoves.map(m => {
        const detail = m.version_group_details.find(v => v.version_group.name === bestVersion && v.move_learn_method.name === 'level-up');
        return {
          name: translateMoveName(m.move.name),
          level: detail ? detail.level_learned_at : 0
        };
      }).sort((a, b) => a.level - b.level);

      const primaryType = data.types?.[0]?.type?.name || 'normal';
      const typesList = data.types ? data.types.map(t => t.type.name) : [];
      let weakToSet = new Set();
      let strongAgainstSet = new Set();

      typesList.forEach(t => {
        if (TYPE_RELATIONS[t]) {
          TYPE_RELATIONS[t].weakTo.forEach(w => weakToSet.add(w));
          TYPE_RELATIONS[t].strongAgainst.forEach(s => strongAgainstSet.add(s));
        }
      });

      setSelectedPokemon({
        id: data.id,
        realBaseId: pokemonItem.id < 10000 ? pokemonItem.id : (pokemonItem.realBaseId || data.id),
        name: pokemonItem.displayName || data.name,
        slug: data.name,
        types: typesList,
        weakTo: Array.from(weakToSet),
        strongAgainst: Array.from(strongAgainstSet),
        defaultImage: data.sprites?.other?.['official-artwork']?.front_default || pokemonItem.image,
        shinyImage: data.sprites?.other?.['official-artwork']?.front_shiny || pokemonItem.image,
        bio: trBio,
        gender: genderText,
        evolutionChain: evoChainArray,
        levelMoves: levelMovesList,
        mainType: primaryType,
        mainColor: TYPE_COLORS[primaryType] || '#3657a8'
      });
      setDetailLoading(false);
    } catch (e) { setDetailLoading(false); }
  };

  const activeTheme = THEMES[currentThemeKey] || THEMES.neon;
  const currentTypeTheme = selectedPokemon ? (TYPE_BACKGROUNDS[selectedPokemon.mainType] || TYPE_BACKGROUNDS.normal) : null;

  const renderPokemon = ({ item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: activeTheme.card }]} onPress={() => openPokemonDetail(item)}>
      <Text style={styles.number}>#{String(item.id).length > 4 ? 'FORM' : String(item.id).padStart(4, '0')}</Text>
      <View style={styles.imageGlowContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      <Text style={styles.name}>{item.displayName || item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Üst Başlık */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.settingsIconButton} onPress={() => setSettingsVisible(true)}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>ArenDex</Text>
          <Text style={styles.authorBadge}>Eğitmen: {userName}</Text>
        </View>
        <TouchableOpacity style={styles.dailyIconButton} onPress={() => setDailyModalVisible(true)}>
          <Text style={styles.settingsIcon}>⭐</Text>
        </TouchableOpacity>
      </View>

      {/* Arama Kutusu */}
      <TextInput
        style={styles.searchInput}
        placeholder="Pokémon Ara (İsim veya No)..."
        placeholderTextColor="#b0b0d0"
        value={search}
        onChangeText={handleSearch}
      />

      {/* Nesil Seçim Sekmeleri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genBar}>
        {GENERATIONS.map((gen, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.genTab, selectedGen.label === gen.label && activeFilterTitle === '' && styles.genTabActive]}
            onPress={() => filterPokemonByGen(gen)}
          >
            <Text style={[styles.genTabText, selectedGen.label === gen.label && activeFilterTitle === '' && styles.genTabTextActive]}>
              {gen.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeFilterTitle !== '' && (
        <View style={styles.activeFilterBanner}>
          <Text style={styles.activeFilterText}>📌 {activeFilterTitle}</Text>
          <TouchableOpacity onPress={() => filterPokemonByGen(selectedGen)}>
            <Text style={styles.clearFilterText}>Filtreyi Kapat ✖</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#ffcb05" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={displayedPokemon}
          keyExtractor={(item) => `${item.id}-${item.name}`}
          renderItem={renderPokemon}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Alt Menü Butonları */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.menuTriggerButton, { backgroundColor: '#6390F0', marginBottom: 6, paddingVertical: 12 }]} onPress={() => setGameMenuVisible(true)}>
          <Text style={[styles.menuTriggerText, { color: '#fff', fontSize: 13 }]}>🎮 Pokémon Bulmaca & Zayıflık Oyunları</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuTriggerButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuTriggerText}>Bölgesel Formlar & Medya Merkezi</Text>
        </TouchableOpacity>
      </View>

      {/* MİNİ OYUNLAR MENÜSÜ */}
      <Modal visible={gameMenuVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dailyModalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setGameMenuVisible(false)}>
              <Text style={styles.closeText}>Kapat ✖</Text>
            </TouchableOpacity>
            <View style={[styles.dailyHeaderBadge, { backgroundColor: 'rgba(99, 144, 240, 0.25)', borderColor: '#6390F0' }]}>
              <Text style={[styles.dailyHeaderTitle, { color: '#6390F0' }]}>🎮 POKÉMON EĞİTİCİ OYUNLAR</Text>
              <Text style={styles.dailyHeaderSubtitle}>Bilgini test et, puanları topla!</Text>
            </View>

            <View style={{ gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: 'rgba(255, 203, 5, 0.25)', borderColor: '#ffcb05' }]} onPress={startWhoIsThatPokemon}>
                <Text style={styles.menuItemText}>🎮 "Bu Pokémon Kim?" (Silüet Tahmini)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: 'rgba(99, 144, 240, 0.25)', borderColor: '#6390F0' }]} onPress={startTypeQuiz}>
                <Text style={styles.menuItemText}>🧠 Tür Zayıflığı Quiz (Süper Etkili Türler)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: 'rgba(76, 217, 100, 0.25)', borderColor: '#4CD964' }]} onPress={startArenaGame}>
                <Text style={styles.menuItemText}>⚔️ Arenin Lideri - Zayıflık Avı</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OYUN 1: BU POKÉMON KİM? */}
      <Modal visible={whoModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dailyModalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setWhoModalVisible(false)}>
              <Text style={styles.closeText}>Kapat ✖</Text>
            </TouchableOpacity>
            <View style={styles.dailyHeaderBadge}>
              <Text style={styles.dailyHeaderTitle}>🎮 BU POKÉMON KİM?</Text>
              <Text style={styles.dailyHeaderSubtitle}>Skor: {whoScore}</Text>
            </View>
            {!whoData ? (
              <ActivityIndicator size="large" color="#ffcb05" style={{ margin: 40 }} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Image source={{ uri: whoData.image }} style={[styles.modalImage, { tintColor: whoMsg ? undefined : '#000' }]} />
                <Text style={[styles.modalName, { marginTop: 10, fontSize: 20, textTransform: 'capitalize' }]}>
                  {whoMsg ? whoData.name : 'Bu Pokémon Kim?'}
                </Text>
                {whoMsg !== '' && <Text style={{ color: '#ffcb05', fontWeight: 'bold', marginVertical: 8, fontSize: 15 }}>{whoMsg}</Text>}
                <View style={{ width: '100%', gap: 10, marginTop: 15 }}>
                  {whoData.options.map((opt, idx) => (
                    <TouchableOpacity key={idx} style={styles.gameOptionBtn} onPress={() => !whoMsg && handleWhoGuess(opt)}>
                      <Text style={styles.gameOptionText}>{opt.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* OYUN 2: TÜR ZAYIFLIĞI QUİZ */}
      <Modal visible={quizModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dailyModalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setQuizModalVisible(false)}>
              <Text style={styles.closeText}>Kapat ✖</Text>
            </TouchableOpacity>
            <View style={[styles.dailyHeaderBadge, { backgroundColor: 'rgba(99, 144, 240, 0.25)', borderColor: '#6390F0' }]}>
              <Text style={[styles.dailyHeaderTitle, { color: '#6390F0' }]}>🧠 TÜR ZAYIFLIĞI UZMANLIĞI</Text>
              <Text style={styles.dailyHeaderSubtitle}>Quiz Skoru: {quizScore}</Text>
            </View>
            {!quizData ? (
              <ActivityIndicator size="large" color="#6390F0" style={{ margin: 40 }} />
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 15 }}>
                  Aşağıdaki türe karşı <Text style={{ color: '#ffcb05', fontWeight: 'bold' }}>SÜPER ETKİLİ (ZAYIF)</Text> olan doğru tür hangisidir?
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[quizData.targetType] || '#333', paddingVertical: 12, paddingHorizontal: 24, marginBottom: 20 }]}>
                  <Text style={[styles.typeText, { fontSize: 16 }]}>{quizData.targetType.toUpperCase()}</Text>
                </View>
                {quizMsg !== '' && <Text style={{ color: '#ffcb05', fontWeight: 'bold', marginVertical: 8, fontSize: 15, textAlign: 'center' }}>{quizMsg}</Text>}
                <View style={{ width: '100%', gap: 10, marginTop: 10 }}>
                  {quizData.options.map((opt, idx) => (
                    <TouchableOpacity key={idx} style={[styles.gameOptionBtn, { backgroundColor: TYPE_COLORS[opt] || 'rgba(255,255,255,0.12)' }]} onPress={() => !quizMsg && handleQuizGuess(opt)}>
                      <Text style={styles.gameOptionText}>{opt.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* OYUN 3: ARENİN LİDERİ */}
      <Modal visible={arenaModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dailyModalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setArenaModalVisible(false)}>
              <Text style={styles.closeText}>Kapat ✖</Text>
            </TouchableOpacity>
            <View style={[styles.dailyHeaderBadge, { backgroundColor: 'rgba(76, 217, 100, 0.25)', borderColor: '#4CD964' }]}>
              <Text style={[styles.dailyHeaderTitle, { color: '#4CD964' }]}>⚔️ ARENİN LİDERİ: ZAYIFLIK AVI</Text>
              <Text style={styles.dailyHeaderSubtitle}>Avcı Skoru: {arenaScore}</Text>
            </View>
            {!arenaTarget ? (
              <ActivityIndicator size="large" color="#4CD964" style={{ margin: 40 }} />
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 12 }}>
                  Rakip Savunma Türü Karşısında <Text style={{ color: '#4CD964', fontWeight: 'bold' }}>ZAYIFLIK NOKTASINI</Text> Yakala!
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[arenaTarget.defendingType] || '#333', paddingVertical: 14, paddingHorizontal: 28, marginBottom: 18 }]}>
                  <Text style={[styles.typeText, { fontSize: 18 }]}>🛡️ {arenaTarget.defendingType.toUpperCase()}</Text>
                </View>
                {arenaMsg !== '' && <Text style={{ color: '#ffcb05', fontWeight: 'bold', marginVertical: 6, fontSize: 14, textAlign: 'center' }}>{arenaMsg}</Text>}
                <View style={{ width: '100%', gap: 8, marginTop: 10 }}>
                  {arenaTarget.options.map((opt, idx) => (
                    <TouchableOpacity key={idx} style={[styles.gameOptionBtn, { backgroundColor: TYPE_COLORS[opt] || 'rgba(255,255,255,0.12)' }]} onPress={() => !arenaMsg && handleArenaAttack(opt)}>
                      <Text style={styles.gameOptionText}>⚔️ {opt.toUpperCase()} ATAĞI</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* GÜNÜN POKÉMON'U MODALI */}
      <Modal visible={dailyModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dailyModalContent}>
            {!dailyPokemon ? (
              <ActivityIndicator size="large" color="#ffcb05" style={{ margin: 50 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setDailyModalVisible(false)}>
                  <Text style={styles.closeText}>Kapat ✖</Text>
                </TouchableOpacity>
                <View style={styles.dailyHeaderBadge}>
                  <Text style={styles.dailyHeaderTitle}>⭐ GÜNÜN POKÉMON'U</Text>
                </View>
                <Text style={[styles.modalNumber, { color: dailyPokemon.mainColor, textAlign: 'center' }]}>
                  #{String(dailyPokemon.id).padStart(4, '0')}
                </Text>
                <Text style={[styles.modalName, { textAlign: 'center', textTransform: 'capitalize' }]}>{dailyPokemon.name}</Text>
                <View style={styles.imageSectionContainer}>
                  <Image source={{ uri: dailyPokemon.image }} style={styles.modalImage} />
                </View>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: dailyPokemon.mainColor }]}>Cinsiyet Oranı</Text>
                  <Text style={styles.bioText}>{dailyPokemon.gender}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: dailyPokemon.mainColor }]}>Gün Hikayesi</Text>
                  <Text style={styles.bioText}>{dailyPokemon.bio}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ÇİZGİ DİZİ ARŞİVİ MODALI */}
      <Modal visible={animeModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dailyModalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setAnimeModalVisible(false)}>
              <Text style={styles.closeText}>Kapat ✖</Text>
            </TouchableOpacity>
            <View style={[styles.dailyHeaderBadge, { backgroundColor: 'rgba(238, 129, 48, 0.25)', borderColor: '#EE8130' }]}>
              <Text style={[styles.dailyHeaderTitle, { color: '#EE8130' }]}>📺 POKÉMON ÇİZGİ DİZİ ARŞİVİ</Text>
              <Text style={styles.dailyHeaderSubtitle}>SezonlukDizi Arşivine Git</Text>
            </View>
            {POKEMON_SERIES_LIST.map((season, idx) => (
              <TouchableOpacity key={idx} style={[styles.menuItem, { backgroundColor: 'rgba(255,255,255,0.08)' }]} onPress={() => Linking.openURL(season.url)}>
                <Text style={styles.menuItemText}>▶️ {season.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* TÜR BİLGİ MODALI */}
      <Modal visible={typeInfoModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dailyModalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setTypeInfoModalVisible(false)}>
              <Text style={styles.closeText}>Kapat ✖</Text>
            </TouchableOpacity>
            {selectedTypeInfo && (
              <View style={[styles.dailyHeaderBadge, { backgroundColor: TYPE_COLORS[selectedTypeInfo] || '#3657a8' }]}>
                <Text style={styles.dailyHeaderTitle}>{selectedTypeInfo.toUpperCase()} TÜRÜ DETAYLARI</Text>
              </View>
            )}
            {typeInfoLoading ? (
              <ActivityIndicator size="large" color="#ffcb05" style={{ margin: 30 }} />
            ) : (selectedTypeInfo && TYPE_RELATIONS[selectedTypeInfo] ? (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: '#ffcb05' }]}>⚡ Hasar Çarpanları & Etkileşimler</Text>
                  <Text style={styles.bioText}>⚡ **2x Güçlü (Zayıf):** {TYPE_RELATIONS[selectedTypeInfo].multiplier2x.join(', ').toUpperCase()}</Text>
                  <Text style={styles.bioText}>🛡️ **0.5x Zayıf (Dirençli):** {TYPE_RELATIONS[selectedTypeInfo].multiplier05.join(', ').toUpperCase()}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: '#ffcb05' }]}>🔥 Bu Türe Sahip Bazı Pokémonlar</Text>
                  <View style={styles.badgeContainer}>
                    {typePokemonList.map((p, idx) => (
                      <TouchableOpacity key={idx} style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.12)' }]} onPress={() => { setTypeInfoModalVisible(false); setModalVisible(false); openPokemonDetail(p); }}>
                        <Text style={[styles.typeText, { textTransform: 'capitalize' }]}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            ) : null)}
          </View>
        </View>
      </Modal>

      {/* AYARLAR */}
      <Modal visible={settingsVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setSettingsVisible(false)}>
          <View style={[styles.settingsContent, { maxHeight: '80%' }]}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>⚙️ Kişiselleştirme & Ayarlar</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Text style={styles.menuCloseBtn}>✖</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.settingsSubTitle}>Kullanıcı / Eğitmen Adı:</Text>
            <TextInput
              style={[styles.searchInput, { marginBottom: 15 }]}
              value={userName}
              onChangeText={async (text) => {
                setUserName(text);
                await AsyncStorage.setItem('@user_name', text);
              }}
              placeholder="Adınızı girin..."
              placeholderTextColor="#b0b0d0"
            />

            <Text style={styles.settingsSubTitle}>Arka Plan Teması & Tüm Türler Seç:</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              <View style={{ gap: 8, paddingBottom: 10 }}>
                {Object.keys(THEMES).map(key => (
                  <TouchableOpacity 
                    key={key} 
                    style={[styles.menuItem, currentThemeKey === key && { borderColor: '#ffcb05', borderWidth: 2, backgroundColor: 'rgba(255,203,5,0.15)' }]} 
                    onPress={() => changeTheme(key)}
                  >
                    <Text style={[styles.menuItemText, currentThemeKey === key && { color: '#ffcb05', fontWeight: 'bold' }]}>{THEMES[key].name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ANA MENÜ (Tüm Bölgesel Formlar, Mega ve G-Max Eksiksiz) */}
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menü & Medya Merkezi</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={styles.menuCloseBtn}>✖</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <TouchableOpacity style={[styles.menuItem, { backgroundColor: 'rgba(238, 129, 48, 0.3)', borderColor: '#EE8130' }]} onPress={() => { setMenuVisible(false); setAnimeModalVisible(true); }}>
                <Text style={[styles.menuItemText, { color: '#ffb380' }]}>📺 Pokémon Çizgi Dizi Arşivi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => loadSpecialList(REGIONAL_POKEMON_LIST.filter(p => p.region === 'hisui'), 'Hisuian Formlar')}>
                <Text style={styles.menuItemText}>🏔️ Hisuian Formlar (Hisui - Tüm Listeler)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => loadSpecialList(REGIONAL_POKEMON_LIST.filter(p => p.region === 'paldea'), 'Paldean Formlar')}>
                <Text style={styles.menuItemText}>🍇 Paldean Formlar (Paldea - Tüm Listeler)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => loadSpecialList(REGIONAL_POKEMON_LIST.filter(p => p.region === 'alola'), 'Alola Bölgesel Formlar')}>
                <Text style={styles.menuItemText}>🌴 Alolan Formlar (Alola - Tüm Listeler)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => loadSpecialList(REGIONAL_POKEMON_LIST.filter(p => p.region === 'galar'), 'Galar Bölgesel Formlar')}>
                <Text style={styles.menuItemText}>🛡️ Galarian Formlar (Galar - Tüm Listeler)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => loadSpecialList(GMAX_POKEMON_LIST, 'Gigantamax Formlar')}>
                <Text style={styles.menuItemText}>⚡ Gigantamax (G-Max - Hepsi)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => loadSpecialList(MEGA_POKEMON_LIST, 'Mega Evrim Formları')}>
                <Text style={styles.menuItemText}>🧬 Mega Evrimler (Eksiksiz Tüm Liste)</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* DETAY MODALI */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: currentTypeTheme ? currentTypeTheme.bg : '#140f26', 
            borderColor: currentTypeTheme ? currentTypeTheme.border : 'rgba(255,255,255,0.15)' 
          }]}>
            {detailLoading || !selectedPokemon ? (
              <ActivityIndicator size="large" color="#ffcb05" style={{ margin: 50 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeText}>Kapat ✖</Text>
                </TouchableOpacity>
                <Text style={[styles.modalNumber, { color: selectedPokemon.mainColor }]}>
                  #{String(selectedPokemon.id).length > 4 ? 'FORM' : String(selectedPokemon.id).padStart(4, '0')}
                </Text>
                <Text style={styles.modalName}>{selectedPokemon.name}</Text>
                
                <View style={[styles.imageSectionContainer, { backgroundColor: currentTypeTheme ? currentTypeTheme.card : 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 10 }]}>
                  <Image source={{ uri: isShiny ? selectedPokemon.shinyImage : selectedPokemon.defaultImage }} style={styles.modalImage} />
                  <TouchableOpacity style={[styles.shinyToggleBtn, isShiny && styles.shinyActiveBtn]} onPress={() => setIsShiny(!isShiny)}>
                    <Text style={styles.shinyBtnText}>{isShiny ? '✨ Normal Form' : '🌟 Shiny Form'}</Text>
                  </TouchableOpacity>

                  {FORM_MAPPINGS[selectedPokemon.realBaseId] && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      {FORM_MAPPINGS[selectedPokemon.realBaseId].mega && currentFormType !== 'mega' && (
                        <TouchableOpacity style={styles.formSwitchBtn} onPress={() => openPokemonDetail(selectedPokemon, FORM_MAPPINGS[selectedPokemon.realBaseId].mega, 'mega')}>
                          <Text style={styles.formSwitchText}>🧬 Mega Form</Text>
                        </TouchableOpacity>
                      )}
                      {FORM_MAPPINGS[selectedPokemon.realBaseId].gmax && currentFormType !== 'gmax' && (
                        <TouchableOpacity style={styles.formSwitchBtn} onPress={() => openPokemonDetail(selectedPokemon, FORM_MAPPINGS[selectedPokemon.realBaseId].gmax, 'gmax')}>
                          <Text style={styles.formSwitchText}>⚡ G-Max Form</Text>
                        </TouchableOpacity>
                      )}
                      {currentFormType !== 'default' && (
                        <TouchableOpacity style={[styles.formSwitchBtn, { backgroundColor: 'rgba(255, 82, 82, 0.25)', borderColor: '#ff5252' }]} onPress={() => openPokemonDetail(selectedPokemon, selectedPokemon.realBaseId, 'default')}>
                          <Text style={[styles.formSwitchText, { color: '#ff5252' }]}>🔄 Normal</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {/* HAREKETLER DOĞRUDAN ÖNE ÇIKARILDI */}
                <View style={[styles.section, { backgroundColor: currentTypeTheme ? currentTypeTheme.card : 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.sectionTitle, { color: selectedPokemon.mainColor }]}>⚔️ Güncel Seviye Hareketleri</Text>
                  {selectedPokemon.levelMoves && selectedPokemon.levelMoves.length > 0 ? (
                    <View style={{ gap: 6, marginTop: 6 }}>
                      {selectedPokemon.levelMoves.map((mv, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.07)', padding: 8, borderRadius: 10 }}>
                          <Text style={{ color: '#fff', fontSize: 13, textTransform: 'capitalize', fontWeight: '600' }}>✨ {mv.name}</Text>
                          <View style={{ backgroundColor: selectedPokemon.mainColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Lv. {mv.level}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.bioText}>Bu Pokémon için hareket verisi bulunamadı.</Text>
                  )}
                </View>

                {selectedPokemon.evolutionChain && selectedPokemon.evolutionChain.length > 0 && (
                  <View style={[styles.section, { backgroundColor: currentTypeTheme ? currentTypeTheme.card : 'rgba(255,255,255,0.08)' }]}>
                    <Text style={[styles.sectionTitle, { color: selectedPokemon.mainColor }]}>🧬 Evrim Zinciri</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 5 }}>
                      {selectedPokemon.evolutionChain.map((evo, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <Text style={{ color: '#4CD964', fontWeight: 'bold', fontSize: 16 }}>➔</Text>}
                          <View style={{ alignItems: 'center' }}>
                            <Image source={{ uri: evo.image }} style={{ width: 60, height: 60 }} />
                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize', marginTop: 3 }}>{evo.name}</Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                )}

                <View style={[styles.section, { backgroundColor: currentTypeTheme ? currentTypeTheme.card : 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.sectionTitle, { color: selectedPokemon.mainColor }]}>Tipler</Text>
                  <View style={styles.badgeContainer}>
                    {selectedPokemon.types.map((t, idx) => (
                      <TouchableOpacity key={idx} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] || '#3657a8' }]} onPress={() => openTypeInfoModal(t)}>
                        <Text style={styles.typeText}>{t.toUpperCase()} ℹ️</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.section, { backgroundColor: currentTypeTheme ? currentTypeTheme.card : 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.sectionTitle, { color: selectedPokemon.mainColor }]}>Pokémon Açıklaması</Text>
                  <Text style={styles.bioText}>{selectedPokemon.bio}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 12 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  settingsIconButton: { backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  dailyIconButton: { backgroundColor: 'rgba(255, 203, 5, 0.25)', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#ffcb05' },
  settingsIcon: { fontSize: 20 },
  headerTextContainer: { alignItems: 'center' },
  title: { fontSize: 34, fontWeight: '900', color: '#ffcb05', letterSpacing: 1.8 },
  authorBadge: { color: '#c0c0e0', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  searchInput: { backgroundColor: 'rgba(255, 255, 255, 0.14)', color: '#fff', padding: 14, borderRadius: 18, fontSize: 15, marginBottom: 10, marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(255, 203, 5, 0.4)' },
  genBar: { minHeight: 46, maxHeight: 52, marginBottom: 10, paddingHorizontal: 4 },
  genTab: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  genTabActive: { backgroundColor: '#ffcb05', borderColor: '#ffcb05' },
  genTabText: { color: '#ddd', fontWeight: 'bold', fontSize: 12.5 },
  genTabTextActive: { color: '#120d2b', fontWeight: '900' },
  activeFilterBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 203, 5, 0.22)', padding: 12, borderRadius: 14, marginHorizontal: 4, marginBottom: 12, borderWidth: 1, borderColor: '#ffcb05' },
  activeFilterText: { color: '#ffcb05', fontWeight: 'bold', fontSize: 13 },
  clearFilterText: { color: '#ff5252', fontWeight: 'bold', fontSize: 12 },
  list: { paddingBottom: 120 },
  card: { flex: 1, margin: 6, borderRadius: 22, padding: 14, alignItems: 'center', borderWidth: 1.2, borderColor: 'rgba(255, 255, 255, 0.2)', elevation: 6 },
  number: { color: '#b0b0d0', fontSize: 11, fontWeight: 'bold', alignSelf: 'flex-start' },
  imageGlowContainer: { backgroundColor: 'rgba(255, 255, 255, 0.07)', borderRadius: 60, padding: 8, marginVertical: 6 },
  image: { width: 105, height: 105 },
  name: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
  bottomBar: { position: 'absolute', bottom: 12, left: 15, right: 15 },
  menuTriggerButton: { backgroundColor: '#ffcb05', paddingVertical: 13, borderRadius: 20, alignItems: 'center', elevation: 10 },
  menuTriggerText: { color: '#120d2b', fontWeight: '900', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, maxHeight: '88%', borderWidth: 2 },
  dailyModalContent: { backgroundColor: '#17112e', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, maxHeight: '88%', borderWidth: 2, borderColor: '#ffcb05' },
  dailyHeaderBadge: { backgroundColor: 'rgba(255, 203, 5, 0.2)', padding: 12, borderRadius: 16, borderWidth: 1.2, borderColor: '#ffcb05', alignItems: 'center', marginBottom: 14 },
  dailyHeaderTitle: { color: '#ffcb05', fontSize: 19, fontWeight: '900', letterSpacing: 1 },
  dailyHeaderSubtitle: { color: '#b0b0d0', fontSize: 12, marginTop: 3, textAlign: 'center' },
  closeButton: { alignSelf: 'flex-end', backgroundColor: '#ff3b30', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 22 },
  closeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalNumber: { fontWeight: 'bold', fontSize: 14 },
  modalName: { color: '#fff', fontSize: 30, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 10 },
  imageSectionContainer: { alignItems: 'center', marginVertical: 10 },
  modalImage: { width: 190, height: 190 },
  shinyToggleBtn: { marginTop: 10, backgroundColor: 'rgba(255, 203, 5, 0.2)', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: '#ffcb05' },
  shinyActiveBtn: { backgroundColor: '#ffcb05' },
  shinyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  formSwitchBtn: { backgroundColor: 'rgba(111, 53, 252, 0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#6F35FC' },
  formSwitchText: { color: '#b59fff', fontWeight: 'bold', fontSize: 11 },
  section: { padding: 14, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  bioText: { color: '#dedef2', fontSize: 13.5, lineHeight: 20 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  typeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' },
  settingsContent: { backgroundColor: '#140f26', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, borderWidth: 1.5, borderColor: 'rgba(255, 203, 5, 0.4)' },
  settingsSubTitle: { color: '#ccc', fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 12 },
  menuContent: { backgroundColor: '#17112e', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, borderWidth: 1.5, borderColor: 'rgba(255, 203, 5, 0.4)' },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.12)' },
  menuTitle: { color: '#ffcb05', fontSize: 18, fontWeight: 'bold' },
  menuCloseBtn: { color: '#bbb', fontSize: 20, fontWeight: 'bold', padding: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.09)', padding: 13, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  menuItemText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  gameOptionBtn: { backgroundColor: 'rgba(255, 255, 255, 0.14)', padding: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 203, 5, 0.4)' },
  gameOptionText: { color: '#fff', fontWeight: 'bold', fontSize: 14, textTransform: 'capitalize' }
});