const symbols = [
  ['beer', <><path d="M7 8h10l-.8 12H7.8L7 8Z"/><path d="M7 11H4v5h3M9 8V5a1 1 0 0 1 2 0v3M13 8V4a1 1 0 0 1 2 0v4M17 11h3v5h-3"/></>],
  ['grid', <><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/></>],
  ['receipt', <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M8 8h8M8 12h8M8 16h4"/></>],
  ['box', <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9M7 5.8l9 5"/></>],
  ['chart', <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7M17 6h4v4"/></>],
  ['users', <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5"/></>],
  ['logout', <path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>],
  ['menu', <path d="M4 6h16M4 12h16M4 18h16"/>],
  ['bell', <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>],
  ['cash', <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3M16 3H6a3 3 0 0 0-3 3"/></>],
  ['plus', <path d="M12 5v14M5 12h14"/>],
  ['search', <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>],
  ['close', <path d="m6 6 12 12M18 6 6 18"/>],
  ['edit', <path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>],
  ['arrow-up', <path d="m7 14 5-5 5 5M12 9v11"/>],
  ['user', <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>],
  ['shield', <><path d="M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></>],
  ['eye', <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>],
  ['arrow', <path d="M5 12h14M13 6l6 6-6 6"/>]
];

export function Icon({ name, ...props }) {
  return <svg className="icon" aria-hidden="true" {...props}><use href={`#icon-${name}`} /></svg>;
}

export function IconSprite() {
  return <svg className="sr-only" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    {symbols.map(([name, content]) => <symbol id={`icon-${name}`} viewBox="0 0 24 24" key={name}>{content}</symbol>)}
  </svg>;
}