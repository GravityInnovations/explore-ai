import Link from "next/link";
import { EmptyState } from "@/components/PageTemplate";

export default function NotFound() {
  return <div className="page-content"><h1>Let’s head back.</h1><EmptyState title="We can’t find that page"><p>Try the catalog to see what’s available.</p><Link className="button primary" href="/catalog">Back to Catalog →</Link></EmptyState></div>;
}
