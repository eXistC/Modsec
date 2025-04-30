export function CreateItemClient(title: string, typename: string, ItemData: {[key: string]: any}): Promise<{
  ItemID: string;
  Title: string;
  CreateAt: string; // This will be a ISO date string
  Message: string;
}>;