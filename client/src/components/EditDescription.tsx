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

export default function EditDescription() {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

  const [nftId, setNftId] = useState("");
  const [nftDes, setNftDes] = useState("");
  const [status, setStatus] = useState("");

  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function edit() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::update_nft_description`,
      arguments: [
        tx.object(nftId),
        tx.pure.string(nftDes),
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
          setStatus(effects?.status.status!);
          setNftId("");
          setNftDes("");
        },
      },
    );
  }

  return (
    <Dialog.Content maxWidth="450px">
      <Dialog.Title>Edit NFT Description</Dialog.Title>
      <Dialog.Description hidden>Edit a NFT Description.</Dialog.Description>

      <Flex direction="column" gap="3">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            NFT Object ID
          </Text>
          <TextField.Root
            placeholder="NFT name"
            onChange={(e) => setNftId(e.target.value)}
          />
        </label>
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            New Description
          </Text>
          <TextArea
            placeholder="NFT Description"
            onChange={(e) => setNftDes(e.target.value)}
          />
        </label>
      </Flex>

      {status && isSuccess && (
        <Container>
          <Text>
            Status: <Badge color="green">{status}</Badge>
          </Text>
          <Text>Description Updated Successfully</Text>
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
            edit();
          }}
          disabled={isPending}
        >
          {isPending ? <ClipLoader size={20} /> : "Save"}
        </Button>
      </Flex>
    </Dialog.Content>
  );
}
