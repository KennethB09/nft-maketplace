import { Flex, Dialog, Text, Button, TextArea, Badge } from "@radix-ui/themes";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import ClipLoader from "react-spinners/ClipLoader";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";

type EditDescriptionProps = {
  objectId: string;
};

export default function EditDescription({ objectId }: EditDescriptionProps) {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();

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
      arguments: [tx.object(objectId), tx.pure.string(nftDes)],
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
          setNftDes("");
        },
      },
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outline">Edit NFT</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Edit NFT Description</Dialog.Title>
        <Dialog.Description hidden>Edit a NFT Description.</Dialog.Description>

        <Flex direction="column" gap="3" mb={"2"}>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              New Description
            </Text>
            <TextArea
              placeholder="NFT Description"
              value={nftDes}
              onChange={(e) => setNftDes(e.target.value)}
            />
          </label>
        </Flex>

        {status && isSuccess && (
          <Flex direction={"column"} gap={"2"}>
            <Text>
              Status: <Badge color="green">{status}</Badge>
            </Text>
            <Text>Description Updated Successfully</Text>
          </Flex>
        )}

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            onClick={() => {
              edit();
            }}
            disabled={isPending}
          >
            {isPending ? <ClipLoader size={20} /> : "Save"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
