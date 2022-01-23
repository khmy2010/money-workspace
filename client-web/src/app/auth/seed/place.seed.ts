import { PlaceType1, PlaceType2 } from "src/app/firestore/model/place.enum";

export type PlaceTypes = PlaceType1 | PlaceType2;

export const entertainmentPlaceSeeds: PlaceTypes[] = [
  PlaceType1.amusement_park,
  PlaceType1.aquarium,
  PlaceType1.art_gallery,
  PlaceType1.bowling_alley,
  PlaceType1.movie_rental,
  PlaceType1.movie_theater,
];

export const barberSeeds: PlaceTypes[] = [
  PlaceType1.beauty_salon,
  PlaceType1.hair_care,
];

export const foodSeeds: PlaceTypes[] = [
  PlaceType1.cafe,
  PlaceType1.restaurant,
  PlaceType2.food
];

export const groceriesSeeds: PlaceTypes[] = [
  PlaceType1.bakery,
  PlaceType1.convenience_store,
];