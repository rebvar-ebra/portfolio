import Link from "next/link";

export default function NotFound() {
  return <main className="page-frame not-found"><div><strong>404</strong><h1>That route is not part of this build.</h1><Link className="button button-primary" href="/en">Return home</Link></div></main>;
}
