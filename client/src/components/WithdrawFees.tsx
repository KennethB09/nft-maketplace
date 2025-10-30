import {
  Dialog,
  Flex,
  TextField,
  Button,
  Text,
  Badge,
  Box,
} from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../utils/networkConfig";
import ClipLoader from "react-spinners/ClipLoader";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

type Tmarketplace = {
  data: {
    content: {
      dataType: string;
      fields: {
        balance: string;
        id: {
          id: string;
        };
        type: string;
        hasPublicTransfer: boolean;
      };
    };
    digest: string;
    objectId: string;
    version: string;
  };
};

export default function WithdrawFees() {
  const wallet = useCurrentAccount();

  const [marketplaceBal, setMarketplaceBal] = useState<Tmarketplace | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  useEffect(() => {
    async function getMarketplaceBalance() {
      setLoading(true);
      const response: any = await suiClient.getObject({
        id: import.meta.env.VITE_MARKETPLACE_OBJECT_ID,
        options: {
          showContent: true,
        },
      });

      setLoading(false);
      setMarketplaceBal(response as Tmarketplace);
    }

    getMarketplaceBalance();
  }, []);

  function withdraw() {
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::nft_marketplace::withdraw_marketplace_fees`,
      arguments: [
        tx.object(import.meta.env.VITE_MARKETPLACE_OBJECT_ID),
        tx.pure.u64(amount),
        tx.pure.address(wallet?.address!),
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
          toast.success("Withdaw Success.")
        },
      },
    );
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Flex
        align={"center"}
          gap={"2"}
          style={{
            border: "2px solid var(--gray-a2)",
            height: "min-content",
            borderRadius: "10px"
          }}
          width={"200px"}
          maxWidth={"200px"}
        >
          <Button variant="surface">Withdraw</Button>
          <Box height={"100%"} width={"100%"} pr={"2"}>
            <Flex justify={"center"} width={"100%"}>
              {loading ? (
                <ClipLoader size={20} color="#fff" />
              ) : (
                <Flex gap={"2"}>
                  <Text>{marketplaceBal?.data.content.fields.balance}</Text>
                  <Text style={{
                    fontWeight: "bold"
                  }}>Mist</Text>
                </Flex>
              )}
            </Flex>
          </Box>
        </Flex>
      </Dialog.Trigger>
      <Dialog.Content width={"400px"}>
        <Dialog.Title>Withdraw NFT Fees</Dialog.Title>
        <Dialog.Description>
          Withdraw earned marketplace fees.<br />
          Note: 1,000,000,000 = 1 Sui
        </Dialog.Description>

        <Flex direction="column" my={"4"}>
          <label>
            <Text as="div" size="2" mb="2" weight="bold">
              Withdraw Amount
            </Text>
            <TextField.Root
              placeholder="Amount to withdraw"
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
            />
          </label>
        </Flex>

        {status && isSuccess && (
          <Flex direction={"column"} gap={"2"} mt={"4"}>
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
          <Button onClick={withdraw} disabled={isPending}>
            {isPending ? <ClipLoader size={20} /> : "Withdraw"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
