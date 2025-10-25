import { Box, Text, Flex, Dialog, Button } from "@radix-ui/themes";
import type { Tcontent, listing } from "../types/data";

type NFTInfoProps = {
  content: Tcontent;
  listingInfo?: listing;
  close: () => void;
};

export default function ListedInfo({
  content,
  listingInfo,
  close,
}: NFTInfoProps) {
  return (
    <Dialog.Content maxWidth="450px">
      <Box width={"60%"}>
        <Box overflow={"hidden"} width={"50%"}>
          <img
            src={content.fields.url}
            style={{ objectFit: "cover" }}
            width={"100%"}
          />
        </Box>
        <Box width={"100%"} p={"4"}>
          <Dialog.Title>Description</Dialog.Title>
          <Dialog.Description hidden>Description</Dialog.Description>
          <Button onClick={close}>X</Button>
          <Box>
            <Text>{content.fields.name}</Text>
            <Text>{content.fields.description}</Text>
            {listingInfo && (
              <Flex direction={"row"} gap={"1"}>
                <Text style={{ fontWeight: "bold" }}>Seller</Text>
                <Text>{listingInfo.seller}</Text>
              </Flex>
            )}
            {listingInfo && (
              <Flex direction={"row"} gap={"1"}>
                <Text style={{ fontWeight: "bold" }}>Price</Text>
                <Text>{listingInfo.price}</Text>
              </Flex>
            )}
          </Box>
          <Box></Box>
        </Box>
      </Box>
    </Dialog.Content>
  );
}
