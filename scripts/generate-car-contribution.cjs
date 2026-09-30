const fs = require("fs");

const username = process.env.GITHUB_USERNAME || "ramanvhantale";
const token = process.env.GITHUB_TOKEN;

if (!token) {
  throw new Error("GITHUB_TOKEN is missing.");
}

const query = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
`;

async function getContributions() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "ramanvhantale-contribution-car"
    },
    body: JSON.stringify({
      query,
      variables: { login: username }
    })
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(JSON.stringify(data.errors, null, 2));
  }

  return data.data.user.contributionsCollection.contributionCalendar;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createCar(x, y) {
  return `
    <g transform="translate(${x},${y})">
      
      <!-- speed lines -->
      <g opacity="0.75">
        <path d="M-28 20 H-8" stroke="#58a6ff" stroke-width="3"
          stroke-linecap="round">
          <animate attributeName="x1"
            values="-28;-45;-28"
            dur="0.35s"
            repeatCount="indefinite"/>
          <animate attributeName="x2"
            values="-8;-25;-8"
            dur="0.35s"
            repeatCount="indefinite"/>
        </path>

        <path d="M-25 28 H-5" stroke="#79c0ff" stroke-width="2"
          stroke-linecap="round">
          <animate attributeName="x1"
            values="-25;-40;-25"
            dur="0.28s"
            repeatCount="indefinite"/>
          <animate attributeName="x2"
            values="-5;-20;-5"
            dur="0.28s"
            repeatCount="indefinite"/>
        </path>
      </g>

      <!-- exhaust -->
      <circle cx="-18" cy="27" r="3" fill="#ff7b72" opacity="0.8">
        <animate attributeName="r"
          values="2;5;2"
          dur="0.35s"
          repeatCount="indefinite"/>
        <animate attributeName="opacity"
          values="0.8;0;0.8"
          dur="0.35s"
          repeatCount="indefinite"/>
      </circle>

      <!-- car body -->
      <path
        d="M-18 18
           L-8 18
           L-1 10
           L15 10
           L23 18
           L30 18
           L34 27
           L32 32
           L-22 32
           L-24 27
           Z"
        fill="#1f6feb"
        stroke="#ffffff"
        stroke-width="1.5"
      />

      <!-- roof -->
      <path
        d="M-4 18 L2 11 L14 11 L20 18 Z"
        fill="#58a6ff"
        stroke="#ffffff"
        stroke-width="1"
      />

      <!-- windows -->
      <path
        d="M1 17 L5 13 L10 13 L10 17 Z"
        fill="#0d1117"
      />

      <path
        d="M12 13 L15 13 L19 17 L12 17 Z"
        fill="#0d1117"
      />

      <!-- headlights -->
      <circle cx="29" cy="22" r="2.5" fill="#f8e45c">
        <animate attributeName="opacity"
          values="0.4;1;0.4"
          dur="0.5s"
          repeatCount="indefinite"/>
      </circle>

      <!-- wheels -->
      <circle cx="-10" cy="32" r="7" fill="#161b22" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="23" cy="32" r="7" fill="#161b22" stroke="#ffffff" stroke-width="1.5"/>

      <circle cx="-10" cy="32" r="2.5" fill="#8b949e"/>
      <circle cx="23" cy="32" r="2.5" fill="#8b949e"/>

      <!-- wheel rotation -->
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 -10 32"
          to="360 -10 32"
          dur="0.25s"
          repeatCount="indefinite"/>
      </g>
    </g>
  `;
}

function generateSvg(calendar) {
  const cell = 13;
  const gap = 3;
  const step = cell + gap;

  const cols = calendar.weeks.length;
  const rows = 7;

  const graphWidth = cols * step;
  const width = Math.max(1000, graphWidth + 80);
  const height = 230;

  const startX = (width - graphWidth) / 2;
  const startY = 55;

  let cells = "";

  calendar.weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day) => {
      const date = new Date(day.date + "T00:00:00Z");
      const row = date.getUTCDay();

      const x = startX + weekIndex * step;
      const y = startY + row * step;

      const color = day.color || "#161b22";

      cells += `
        <rect
          x="${x}"
          y="${y}"
          width="${cell}"
          height="${cell}"
          rx="3"
          fill="${escapeXml(color)}">
          <title>${escapeXml(day.date)} — ${day.contributionCount} contributions</title>
        </rect>
      `;
    });
  });

  const carStart = startX - 60;
  const carEnd = startX + graphWidth + 25;

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  role="img"
  aria-label="Raman's GitHub contribution graph with an animated racing car">

  <rect
    width="100%"
    height="100%"
    rx="14"
    fill="#0d1117"/>

  <text
    x="${width / 2}"
    y="28"
    text-anchor="middle"
    fill="#58a6ff"
    font-family="Arial, sans-serif"
    font-size="18"
    font-weight="700">
    🏎️ CONTRIBUTION RACE
  </text>

  <!-- contribution cells -->
  <g>
    ${cells}
  </g>

  <!-- racing lane -->
  <line
    x1="${startX - 10}"
    y1="${startY + 3 * step + 7}"
    x2="${startX + graphWidth + 10}"
    y2="${startY + 3 * step + 7}"
    stroke="#30363d"
    stroke-width="2"
    stroke-dasharray="8 8"
    opacity="0.8"/>

  <!-- animated car -->
  <g>
    ${createCar(carStart, startY + 3 * step - 15)}

    <animateTransform
      attributeName="transform"
      type="translate"
      values="0 0; ${carEnd - carStart} 0"
      dur="3.2s"
      repeatCount="indefinite"
      calcMode="spline"
      keySplines="0.2 0 0.8 1"
      keyTimes="0;1"/>
  </g>

  <!-- finish line -->
  <g transform="translate(${startX + graphWidth + 18},${startY + 3 * step - 8})">
    <rect width="5" height="45" fill="#f0f6fc"/>
    <rect x="5" y="0" width="8" height="8" fill="#f0f6fc"/>
    <rect x="13" y="0" width="8" height="8" fill="#f85149"/>
    <rect x="5" y="8" width="8" height="8" fill="#f85149"/>
    <rect x="13" y="8" width="8" height="8" fill="#f0f6fc"/>
  </g>

  <text
    x="${width / 2}"
    y="${height - 14}"
    text-anchor="middle"
    fill="#8b949e"
    font-family="Arial, sans-serif"
    font-size="11">
    ${calendar.totalContributions} contributions in the last year • Keep coding 🚀
  </text>

</svg>
`;
}

async function main() {
  const calendar = await getContributions();

  const svg = generateSvg(calendar);

  fs.mkdirSync("profile", { recursive: true });

  fs.writeFileSync(
    "profile/contribution-car.svg",
    svg,
    "utf8"
  );

  console.log("Generated profile/contribution-car.svg");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
