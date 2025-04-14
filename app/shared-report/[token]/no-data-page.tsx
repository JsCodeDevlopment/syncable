import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

interface NoDataPageProps {
  report: any;
}

export function NoDataPage({ report }: NoDataPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-3 md:px-10 lg:px-20">
          <div className="flex items-center">
            <Image
              src="/images/syncable-logo.png"
              alt="Syncable Logo"
              width={140}
              height={120}
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="px-3 md:px-10 lg:px-20 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Shared Time Report</h1>
            <p className="text-muted-foreground">
              {report.report_type.charAt(0).toUpperCase() +
                report.report_type.slice(1)}{" "}
              report from {new Date(report.start_date).toLocaleDateString()} to{" "}
              {new Date(report.end_date).toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                This report doesn't contain any time entries for the selected
                period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                No time entries were found for this report period.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
