export interface Preset {
  id: string; // e.g., 'mika'
  name: string; // e.g., 'Mika'
  // A map to tell us which of the 8 starting cards gets which artwork
  cardArtwork: {
    basic1: string; // e.g., 'start1' (will become 'start1.png')
    basic2: string;
    basic3: string;
    job: string;
    unique1: string;
    unique2: string;
    unique3: string;
    unique4: string;
  };
}