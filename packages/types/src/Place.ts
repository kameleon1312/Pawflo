export type PlaceType = 'VET' | 'SHOP' | 'GROOMER';

export interface Place {
  id:       string;
  name:     string;
  type:     PlaceType;
  address:  string;
  city:     string;
  lat:      number;
  lng:      number;
  phone?:   string | null;
  website?: string | null;
}
