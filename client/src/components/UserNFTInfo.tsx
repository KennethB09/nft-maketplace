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
    <Dialog.Content
      maxHeight={{ initial: "100vh", sm: "fit-content" }}
      maxWidth={{ initial: "100vw", sm: "550px" }}
      style={{ padding: "0" }}
    >
      <Flex
        direction={"row"}
        justify={"between"}
        p={"3"}
        style={{
          borderBottom: "2px solid var(--gray-a2)",
        }}
      >
        <Dialog.Title mb={"0"}>Description</Dialog.Title>
        <Button variant="ghost" onClick={() => close("userNFT")}>
          X
        </Button>
      </Flex>
      <Flex direction={{ initial: "column", sm: "row" }}>
        <Box overflow={"hidden"} width={{ initial: "100%", sm: "50%" }}>
          <img
            src={data.content.fields.url}
            style={{ objectFit: "cover" }}
            width={"100%"}
          />
        </Box>

        <Flex
          direction={"column"}
          width={{ initial: "100%", sm: "50%" }}
          py={{ initial: "3", sm: "0"}}
          gap={"2"}
          style={{
            borderLeft: "2px solid var(--gray-a2)",
          }}
        >
          <Flex gap={"1"} px={"3"} justify={{ initial: "center", sm: "end" }} pt={{ initial: "0", sm: "3" }}>
            <ListNFT objectId={data.objectId} />

            <EditDescription objectId={data.objectId} />

            <BurnNFT objectId={data.objectId} />
          </Flex>

          <Flex direction={"column"} px={"3"}>
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
