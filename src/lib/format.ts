export function formatMMK(amount: number): string {
  return `K ${amount.toLocaleString("en-US")}`;
}
