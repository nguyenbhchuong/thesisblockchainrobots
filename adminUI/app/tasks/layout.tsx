import ImportContext from "@/context/Import/ImportContext";

export default function ImportLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return <ImportContext>{children}</ImportContext>;
}
