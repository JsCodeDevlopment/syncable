import { DataPage } from "@/app/shared-report/[token]/data-page";

export default function SharedReportPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  return <DataPage token={token} />;
}
