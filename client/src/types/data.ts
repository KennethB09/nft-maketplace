export type listing = {
  listing_id: string;
  nft_id: string;
  seller: string;
  price: number;
};

export type Tcontent = {
  dataType: string;
  fields: {
    description: string;
    name: string;
    url: string;
  };
};

export type data = {
  digest: string;
  objectId: string;
  type: string;
  version: string;
  content: Tcontent;
};

export type nftsData = {
  data: data;
};