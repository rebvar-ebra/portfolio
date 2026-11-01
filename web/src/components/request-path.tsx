import type { SiteContent } from "@/content/site";

export function RequestPath({ content }: { content: SiteContent["home"]["requestPath"] }) {
  return (
    <figure className="request-path" aria-labelledby="request-path-title">
      <figcaption id="request-path-title" className="request-path-title">
        {content.title}
      </figcaption>
      {content.nodes.map((node) => (
        <div className="path-node" key={node.index}>
          <span className="path-index">{node.index}</span>
          <span className="path-copy"><strong>{node.title}</strong><span>{node.description}</span></span>
        </div>
      ))}
    </figure>
  );
}
