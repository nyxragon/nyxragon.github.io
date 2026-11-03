/**
 * FactTiles — a key-fact panel with hierarchy: the FIRST fact is the hero (a
 * large display figure + caption), the rest are supporting points beside it.
 * Used for the §3 "your legal right" beat: 2 hours · No court · No lawyer · Free.
 * Fed by a ```facts fence (parsed in MarkdownRenderer): "BIG | caption" per line,
 * first line = hero. Static — a scannable anchor, not machinery.
 */

export type Fact = { big: string; caption: string };

export function FactTiles({ items }: { items: Fact[] }) {
  if (!items.length) return null;
  const [hero, ...points] = items;
  return (
    <div className="law-stat">
      <div className="law-stat-hero">
        <div className="law-stat-big">{hero.big}</div>
        {hero.caption && <div className="law-stat-cap">{hero.caption}</div>}
      </div>
      {points.length > 0 && <div className="law-stat-div" aria-hidden="true" />}
      {points.length > 0 && (
        <div className="law-stat-points">
          {points.map((p, i) => (
            <div className="law-stat-point" key={i}>
              <span className="law-stat-mk" aria-hidden="true">
                ✦
              </span>
              <span>
                <b>{p.big}</b>{" "}
                {p.caption && <span className="law-stat-pc">{p.caption}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
