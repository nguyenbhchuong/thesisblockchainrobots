import QueryContext from "@/context/Query/QueryContext";

export default function QueryLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return <QueryContext>{children}</QueryContext>;
}
