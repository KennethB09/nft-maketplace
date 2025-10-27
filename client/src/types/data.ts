export type listing = {
  listing_id: string;
  nft_id: string;
  seller: string;
  price: number;
};

export type Tcontent = {
  dataType: string;
  fields: {
    id: { id: string };
    description: string;
    name: string;
    url: string;
  };
};

export type ListingNFT = {
  id: { id: string };
  nft: Tcontent;
  price: string;
  seller: string;
}

export type listingContent = {
  dataType: string;
  fields: ListingNFT
}

export type data = {
  digest: string;
  objectId: string;
  version: string;
  content: listingContent;
};

export type nftData = {
  digest: string;
  objectId: string;
  version: string;
  content: Tcontent;
};

export type nftsData = {
  data: data;
};

export type userNftsData = {
  data: nftData;
}

export type listedNFTs = listing & data;