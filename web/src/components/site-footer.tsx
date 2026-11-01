import type { SiteContent } from "@/content/site";

export function SiteFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer">
      <p>{content.footer.note}</p>
      <p>{content.footer.availability}</p>
    </footer>
  );
}
