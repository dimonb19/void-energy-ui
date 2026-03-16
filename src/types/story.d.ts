/** Gate requiring ownership of any NFT in a collection. */
interface TileGateCollection {
  type: 'nft-collection';
  name: string;
}

/** Gate requiring ownership of specific NFT IDs within a collection. */
interface TileGateNftIds {
  type: 'nft-id';
  collection: string;
  ids: string[];
}

/** Gate requiring ownership of an NFT within an ID range in a collection. */
interface TileGateNftRange {
  type: 'nft-id';
  collection: string;
  range: [min: number, max: number];
}

/** Gate requiring a minimum balance of a fungible token. */
interface TileGateFungible {
  type: 'fungible';
  token: string;
  amount: number;
}

type TileGate =
  | TileGateCollection
  | TileGateNftIds
  | TileGateNftRange
  | TileGateFungible;

interface StoryData {
  title: string;
  href: string;
  author: { name: string; avatar?: string; href?: string };
  genres: string[];
  image: string;
  mark?: 'resume' | 'complete' | 'replay';
  gate?: TileGate[];
}

interface CategoryDef {
  id: string;
  title: string;
  tagline: string;
  stories: StoryData[];
}
