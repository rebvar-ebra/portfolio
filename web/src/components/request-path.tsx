export function RequestPath() {
  return (
    <figure className="request-path" aria-labelledby="request-path-title">
      <figcaption id="request-path-title" className="request-path-title">
        A request, made visible
      </figcaption>
      <div className="path-node">
        <span className="path-index">01</span>
        <span className="path-copy"><strong>Interface</strong><span>Intent becomes structured input</span></span>
      </div>
      <div className="path-node">
        <span className="path-index">02</span>
        <span className="path-copy"><strong>API</strong><span>Rules validate and coordinate</span></span>
      </div>
      <div className="path-node">
        <span className="path-index">03</span>
        <span className="path-copy"><strong>Data</strong><span>State changes, then flows back</span></span>
      </div>
    </figure>
  );
}
