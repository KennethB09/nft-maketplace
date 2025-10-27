import { Dialog, Flex, TextField, Button, Text, Badge } from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";

export default function WithdrawFees() {
  const wallet = useCurrentAccount();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  function withdraw() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::withdraw_marketplace_fees`,
      arguments: [
        tx.object(import.meta.env.VITE_MARKETPLACE_OBJECT_ID),
        tx.pure.u64(amount),
        tx.pure.address(wallet?.address!)
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
          setAmount("");
        },
      },
    );
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Flex>
            Withdraw
        </Flex>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Withdraw NFT Fees</Dialog.Title>
        <Dialog.Description hidden>Withdraw NFT Fees</Dialog.Description>

        <Flex direction="column" gap="3" mb={"2"}>
          <label>
            <Text as="div" size="2" mb="1" weight="regular">
            Withdraw Amount
          </Text>
          <TextField.Root
            placeholder="Amount to withdraw"
            onChange={(e) => setAmount(e.target.value)}
          />
          </label>
        </Flex>

        {status && isSuccess && (
          <Flex direction={"column"} gap={"2"}>
            <Text>
              Status: <Badge color="green">{status}</Badge>
            </Text>
            <Text>Fees withdraw successfully</Text>
          </Flex>
        )}

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            onClick={withdraw}
            disabled={isPending}
          >
            {isPending ? <ClipLoader size={20} /> : "Withdraw"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
