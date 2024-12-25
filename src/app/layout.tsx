import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Zealthy Demo",
  description: "admin customizable onboarding flow",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
`
  docker run -d \
  --name cloud-sql-proxy \
  -v /Users/jordanjones/Downloads/zealthy-demo-445803-d898c9a4c8ea.json:/config/service-account.json:ro \
  -p 127.0.0.1:3306:3306 \
  gcr.io/cloudsql-docker/gce-proxy:latest /cloud_sql_proxy \
  -instances=zealthy-demo-445803:us-central1:zealthy-app-db=tcp:0.0.0.0:3306 \
  -credential_file=/config/service-account.json
`
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
