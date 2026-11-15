import type { ReactNode } from "react";

// Inline-SVG hero for the Keycloak group-move escalation (```attackdiagram).
// Shows ordinary group C being moved under admin-role group P, and the pawn
// inheriting realm-admin down the P -> C -> pawn chain. Dark-mode native,
// server-rendered, no client JS. Self-contained (no props).
export function AttackDiagram(): ReactNode {
  return (
    <figure className="attackdiagram">
      <svg
        viewBox="0 0 560 360"
        className="akd-svg"
        role="img"
        aria-label="Group C is moved under admin-role group P; the pawn inside C then inherits realm-admin through the P to C chain."
      >
        <defs>
          <filter id="akd-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="akd-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#8b7cff" />
          </marker>
          <marker
            id="akd-arrow-red"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#ff6a86" />
          </marker>
        </defs>

        {/* actor context */}
        <text x="190" y="20" className="akd-eyebrow">
          gadmin · manage-users only
        </text>

        {/* ghost: C before the move */}
        <rect
          x="26"
          y="150"
          width="96"
          height="48"
          rx="12"
          className="akd-ghost"
        />
        <text x="74" y="179" className="akd-ghost-t" textAnchor="middle">
          group C
        </text>
        <path
          d="M126 174 C 150 174, 158 182, 182 182"
          className="akd-move"
          markerEnd="url(#akd-arrow)"
        />
        <text x="60" y="138" className="akd-move-t">
          move
        </text>

        {/* P — admin-role group */}
        <rect x="190" y="30" width="240" height="72" rx="14" className="akd-p" />
        <text x="214" y="60" className="akd-title">
          Group P
        </text>
        <g>
          <rect
            x="214"
            y="70"
            width="116"
            height="22"
            rx="11"
            className="akd-rolepill"
          />
          <text x="272" y="85" className="akd-role" textAnchor="middle">
            realm-admin
          </text>
        </g>

        {/* P -> C edge (the move result) */}
        <line x1="310" y1="102" x2="310" y2="150" className="akd-edge" />
        <text x="326" y="130" className="akd-note-amber">
          no map-role check
        </text>

        {/* C — ordinary group, now nested under P */}
        <rect x="190" y="150" width="240" height="64" rx="14" className="akd-c" />
        <text x="214" y="180" className="akd-title akd-c-t">
          Group C
        </text>
        <text x="214" y="201" className="akd-sub">
          attacker-controlled
        </text>

        {/* C -> pawn edge (inheritance) */}
        <line
          x1="310"
          y1="214"
          x2="310"
          y2="258"
          className="akd-edge-red"
          markerEnd="url(#akd-arrow-red)"
        />
        <text x="326" y="240" className="akd-note-red">
          inherits
        </text>

        {/* pawn — now realm-admin */}
        <rect
          x="205"
          y="262"
          width="210"
          height="60"
          rx="14"
          className="akd-pawn"
          filter="url(#akd-glow)"
        />
        <text x="232" y="291" className="akd-title akd-pawn-t">
          pawn
        </text>
        <text x="232" y="309" className="akd-pawn-sub">
          0 roles → realm-admin
        </text>
      </svg>
      <figcaption className="akd-cap">
        <code>POST /admin/realms/r/groups/&#123;P&#125;/children</code> moves C
        under P. No <code>checkAdminGroupRoles</code> runs, so the pawn inherits{" "}
        <code>realm-admin</code>.
      </figcaption>
    </figure>
  );
}
