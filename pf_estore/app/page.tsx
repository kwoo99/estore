import Link from "next/link";

export default function Test() {
  return (
    <main>
      <h1>Welcome to the E-Store!</h1>
    <div className="links">
        <Link href="/products" className="Link">
          Products
        </Link>
    </div>
    </main>
  );
}