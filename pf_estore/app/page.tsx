import Link from "next/link";

export default function Test() {
  return (
    <main>
    <div className="links">
        <Link href="/products" className="Link">
          Products
        </Link>
    </div>
    </main>
  );
}