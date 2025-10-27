import { Dialog, Flex, Button, Box, Text } from "@radix-ui/themes";
import EditDescription from "./EditDescription";
import BurnNFT from "./BurnNFT";
import ListNFT from "./ListNFT";
import { nftData } from "../types/data";

type UserNFTInfoProps = {
  data: nftData;
  close: (type: "userNFT" | "listingNFT") => void;
};

export default function UserNFTInfo({ data, close }: UserNFTInfoProps) {
  // console.log("usernft", data)
  return (
    <Dialog.Content maxWidth="450px" style={{ padding: "0" }}>
      <Flex gap={"2"}>
        <Box overflow={"hidden"} width={"50%"}>
          <img
            src={data.content.fields.url}
            style={{ objectFit: "cover" }}
            width={"100%"}
          />
        </Box>

        <Flex direction={"column"} width={"100%"} p={"3"} gap={"2"}>
          <Flex direction={"row"} justify={"between"}>
            <Dialog.Title>Description</Dialog.Title>
            <Button variant="ghost" onClick={() => close("userNFT")}>
              X
            </Button>
          </Flex>

          <Flex gap={"2"}>
            <ListNFT objectId={data.objectId} />

            <EditDescription objectId={data.objectId} />

            <BurnNFT objectId={data.objectId} />
          </Flex>

          <Flex direction={"column"}>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
              {data.content.fields.name}
            </Text>
            <Text>{data.content.fields.description}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Dialog.Content>
  );
}
