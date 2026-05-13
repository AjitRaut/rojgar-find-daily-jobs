import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="text-lg font-semibold tracking-tight text-foreground">Rojgar Find – Daily Jobs</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Connect customers with verified skilled workers. AI-assisted matching, transparent job flow, and trust built
            into every hire.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Product</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/register" className="transition hover:text-brand">
                  Get started
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-brand">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Roles</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Hire workers</li>
              <li>Find daily jobs</li>
              <li>Admin tools</li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Built for</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Towns &amp; cities</li>
              <li>On-site trades</li>
              <li>Fair ratings</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Rojgar Find – Daily Jobs. Crafted for clarity and speed.
      </div>
    </footer>
  );
}
