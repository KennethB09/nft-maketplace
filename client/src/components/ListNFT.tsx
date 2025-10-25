import {
  Flex,
  Dialog,
  Text,
  TextField,
  Button,
  TextArea,
  Container,
  Badge,
} from "@radix-ui/themes";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import ClipLoader from "react-spinners/ClipLoader";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";

export default function ListNFT() {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const [nftName, setNftName] = useState("");
  const [nftDes, setNftDes] = useState("");
  const [nftUrl, setNftUrl] = useState("");
  const [objectCreated, setObjectCreated] = useState("");

  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function mint() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::mint_to_sender`,
      arguments: [
        tx.pure.string(nftName),
        tx.pure.string(nftDes),
        tx.pure.string(nftUrl),
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          const { effects } = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          });
          setObjectCreated(effects?.created?.[0]?.reference?.objectId!);
          setNftName("");
          setNftDes("");
          setNftUrl("");
        },
      },
    );
  }

  return (
    <Dialog.Content maxWidth="450px">
      <Dialog.Title>Mint NFT</Dialog.Title>
      <Dialog.Description hidden>Mint a NFT.</Dialog.Description>

      <Flex direction="column" gap="3">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Name
          </Text>
          <TextField.Root
            placeholder="NFT name"
            onChange={(e) => setNftName(e.target.value)}
          />
        </label>
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Description
          </Text>
          <TextArea
            placeholder="NFT Description"
            onChange={(e) => setNftDes(e.target.value)}
          />
        </label>
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Image URL
          </Text>
          <TextField.Root
            placeholder="Image URL"
            onChange={(e) => setNftUrl(e.target.value)}
          />
        </label>
      </Flex>

      {objectCreated && isSuccess && (
        <Container>
          <Text>
            Status: <Badge color="green">Success</Badge>
          </Text>
          <Text>{objectCreated}</Text>
        </Container>
      )}

      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          size="3"
          onClick={() => {
            mint();
          }}
          disabled={isPending}
        >
          {isPending ? <ClipLoader size={20} /> : "Mint"}
        </Button>
      </Flex>
    </Dialog.Content>
  );
}
