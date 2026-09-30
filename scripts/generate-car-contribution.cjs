import json
import os
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


USERNAME = os.getenv("GITHUB_USERNAME", "ramanvhantale")
TOKEN = os.getenv("GITHUB_TOKEN")

OUTPUT = Path("profile/contribution-car.gif")


# ---------------------------------------------------------
# GITHUB CONTRIBUTION DATA
# ---------------------------------------------------------

QUERY = """
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
"""


def get_contribution_data():

    if not TOKEN:
        raise RuntimeError("GITHUB_TOKEN is missing.")

    body = json.dumps({
        "query": QUERY,
        "variables": {
            "login": USERNAME
        }
    }).encode("utf-8")

    request = urllib.request.Request(
        "https://api.github.com/graphql",
        data=body,
        headers={
            "Authorization": f"bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "ramanvhantale-f1-contribution-race"
        },
        method="POST"
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.load(response)

    if data.get("errors"):
        raise RuntimeError(
            json.dumps(data["errors"], indent=2)
        )

    return data["data"]["user"]["contributionsCollection"]["contributionCalendar"]


# ---------------------------------------------------------
# COLORS
# ---------------------------------------------------------

BACKGROUND = "#070b0f"
PANEL = "#0b1117"

GREEN_0 = "#161b22"
GREEN_1 = "#0e4429"
GREEN_2 = "#006d32"
GREEN_3 = "#26a641"
GREEN_4 = "#39d353"

GRID = "#21262d"

WHITE = "#f0f6fc"
GRAY = "#8b949e"

RED = "#e10600"
DARK_RED = "#8b0000"

BLUE = "#071d49"
LIGHT_BLUE = "#1f6feb"

YELLOW = "#f2d14b"

BLACK = "#050505"


# ---------------------------------------------------------
# CONTRIBUTION LEVEL
# ---------------------------------------------------------

def contribution_level(count, maximum):

    if count <= 0:
        return 0

    ratio = count / max(1, maximum)

    if ratio < 0.20:
        return 1

    if ratio < 0.40:
        return 2

    if ratio < 0.70:
        return 3

    return 4


# ---------------------------------------------------------
# ROUNDED RECTANGLE
# ---------------------------------------------------------

def rounded(draw, box, radius, fill, outline=None, width=1):

    draw.rounded_rectangle(
        box,
        radius=radius,
        fill=fill,
        outline=outline,
        width=width
    )


# ---------------------------------------------------------
# F1 CAR
# ---------------------------------------------------------

def draw_f1_car(image, x, y, scale=1.0):

    layer = Image.new(
        "RGBA",
        image.size,
        (0, 0, 0, 0)
    )

    draw = ImageDraw.Draw(layer)

    s = scale

    def p(points):

        return [
            (
                int(x + px * s),
                int(y + py * s)
            )
            for px, py in points
        ]

    # -----------------------------------------------------
    # SPEED LINES
    # -----------------------------------------------------

    draw.line(
        p([(-120, 5), (-40, 5)]),
        fill=(255, 255, 255, 70),
        width=max(2, int(3 * s))
    )

    draw.line(
        p([(-105, 16), (-35, 16)]),
        fill=(88, 166, 255, 90),
        width=max(2, int(3 * s))
    )

    draw.line(
        p([(-90, 28), (-25, 28)]),
        fill=(255, 255, 255, 45),
        width=max(1, int(2 * s))
    )

    # -----------------------------------------------------
    # REAR WING
    # -----------------------------------------------------

    draw.rectangle(
        [
            x - 60 * s,
            y - 14 * s,
            x - 20 * s,
            y - 8 * s
        ],
        fill=DARK_RED
    )

    draw.rectangle(
        [
            x - 55 * s,
            y - 20 * s,
            x - 25 * s,
            y - 15 * s
        ],
        fill=BLUE
    )

    # Rear wing supports

    draw.line(
        p([(-50, -14), (-50, -2)]),
        fill=WHITE,
        width=max(1, int(2 * s))
    )

    draw.line(
        p([(-28, -14), (-28, -2)]),
        fill=WHITE,
        width=max(1, int(2 * s))
    )

    # -----------------------------------------------------
    # MAIN BODY
    # -----------------------------------------------------

    body = [
        (-52, 8),
        (-38, 2),
        (-22, -5),
        (-8, -9),
        (12, -9),
        (30, -5),
        (45, 2),
        (60, 7),
        (66, 13),
        (60, 18),
        (35, 19),
        (20, 15),
        (-15, 16),
        (-36, 19),
        (-53, 15)
    ]

    draw.polygon(
        p(body),
        fill=BLUE,
        outline=WHITE
    )

    # -----------------------------------------------------
    # RED BODY PANELS
    # -----------------------------------------------------

    draw.polygon(
        p([
            (-51, 8),
            (-33, 3),
            (-16, 0),
            (-2, 0),
            (-12, 7),
            (-30, 13),
            (-51, 13)
        ]),
        fill=RED
    )

    draw.polygon(
        p([
            (18, -8),
            (31, -5),
            (44, 1),
            (31, 5),
            (17, 2)
        ]),
        fill=RED
    )

    # -----------------------------------------------------
    # YELLOW STRIPES
    # -----------------------------------------------------

    draw.line(
        p([
            (-45, 5),
            (-20, 1),
            (2, -1),
            (24, 0),
            (44, 5)
        ]),
        fill=YELLOW,
        width=max(2, int(3 * s))
    )

    draw.line(
        p([
            (-27, 11),
            (22, 10),
            (50, 9)
        ]),
        fill=YELLOW,
        width=max(1, int(2 * s))
    )

    # -----------------------------------------------------
    # FRONT NOSE
    # -----------------------------------------------------

    draw.polygon(
        p([
            (25, 1),
            (62, 7),
            (82, 11),
            (48, 12)
        ]),
        fill=LIGHT_BLUE
    )

    # -----------------------------------------------------
    # FRONT WING
    # -----------------------------------------------------

    draw.polygon(
        p([
            (48, 8),
            (78, 9),
            (91, 13),
            (85, 16),
            (47, 14)
        ]),
        fill=RED,
        outline=WHITE
    )

    draw.line(
        p([
            (56, 15),
            (92, 17)
        ]),
        fill=WHITE,
        width=max(1, int(1 * s))
    )

    draw.line(
        p([
            (61, 11),
            (90, 13)
        ]),
        fill=YELLOW,
        width=max(1, int(2 * s))
    )

    # -----------------------------------------------------
    # COCKPIT
    # -----------------------------------------------------

    draw.ellipse(
        [
            x - 3 * s,
            y - 13 * s,
            x + 23 * s,
            y + 2 * s
        ],
        fill=BLACK,
        outline=WHITE
    )

    # -----------------------------------------------------
    # HALO
    # -----------------------------------------------------

    draw.arc(
        [
            x - 8 * s,
            y - 18 * s,
            x + 29 * s,
            y + 10 * s
        ],
        start=190,
        end=350,
        fill=WHITE,
        width=max(1, int(2 * s))
    )

    draw.line(
        p([
            (10, -16),
            (10, 1)
        ]),
        fill=WHITE,
        width=max(1, int(2 * s))
    )

    # -----------------------------------------------------
    # DRIVER HELMET
    # -----------------------------------------------------

    draw.ellipse(
        [
            x + 3 * s,
            y - 11 * s,
            x + 14 * s,
            y
        ],
        fill=YELLOW,
        outline=DARK_RED
    )

    # -----------------------------------------------------
    # WHEELS
    # -----------------------------------------------------

    wheels = [
        (-27, 18),
        (43, 17)
    ]

    for wx, wy in wheels:

        radius = 11 * s

        draw.ellipse(
            [
                x + wx * s - radius,
                y + wy * s - radius,
                x + wx * s + radius,
                y + wy * s + radius
            ],
            fill=BLACK,
            outline=WHITE
        )

        draw.ellipse(
            [
                x + (wx - 4) * s,
                y + (wy - 4) * s,
                x + (wx + 4) * s,
                y + (wy + 4) * s
            ],
            fill="#6e7681"
        )

        draw.ellipse(
            [
                x + (wx - 1.5) * s,
                y + (wy - 1.5) * s,
                x + (wx + 1.5) * s,
                y + (wy + 1.5) * s
            ],
            fill="#111827"
        )

    # -----------------------------------------------------
    # EXHAUST GLOW
    # -----------------------------------------------------

    glow = Image.new(
        "RGBA",
        image.size,
        (0, 0, 0, 0)
    )

    glow_draw = ImageDraw.Draw(glow)

    glow_draw.ellipse(
        [
            x - 88 * s,
            y + 1 * s,
            x - 45 * s,
            y + 19 * s
        ],
        fill=(255, 70, 0, 160)
    )

    glow = glow.filter(
        ImageFilter.GaussianBlur(
            max(2, int(6 * s))
        )
    )

    layer.alpha_composite(glow)

    # -----------------------------------------------------
    # SPARKS
    # -----------------------------------------------------

    sparks = [
        (-58, 25, 2),
        (-43, 30, 1),
        (-70, 23, 1),
        (67, 24, 1)
    ]

    for sx, sy, radius in sparks:

        draw.ellipse(
            [
                x + (sx - radius) * s,
                y + (sy - radius) * s,
                x + (sx + radius) * s,
                y + (sy + radius) * s
            ],
            fill=YELLOW
        )

    image.alpha_composite(layer)


# ---------------------------------------------------------
# DRAW CONTRIBUTION GRAPH
# ---------------------------------------------------------

def draw_contribution_graph(
    draw,
    calendar,
    width,
    height
):

    weeks = calendar["weeks"]

    all_days = []

    for week in weeks:
        for day in week["contributionDays"]:
            all_days.append(day)

    maximum = max(
        [
            day["contributionCount"]
            for day in all_days
        ],
        default=1
    )

    cell = 12
    gap = 4
    step = cell + gap

    graph_width = min(
        53 * step,
        width - 100
    )

    start_x = (width - graph_width) // 2

    start_y = 142

    import datetime

    for week_index, week in enumerate(weeks[:53]):

        for day in week["contributionDays"]:

            date = datetime.date.fromisoformat(
                day["date"]
            )

            row = (date.weekday() + 1) % 7

            x = start_x + week_index * step

            y = start_y + row * step

            level = contribution_level(
                day["contributionCount"],
                maximum
            )

            colors = [
                GREEN_0,
                GREEN_1,
                GREEN_2,
                GREEN_3,
                GREEN_4
            ]

            color = colors[level]

            rounded(
                draw,
                (
                    x,
                    y,
                    x + cell,
                    y + cell
                ),
                3,
                color
            )


# ---------------------------------------------------------
# CREATE FRAME
# ---------------------------------------------------------

def create_frame(
    calendar,
    frame_number,
    total_frames
):

    WIDTH = 1200
    HEIGHT = 330

    image = Image.new(
        "RGBA",
        (WIDTH, HEIGHT),
        BACKGROUND
    )

    draw = ImageDraw.Draw(image)

    # -----------------------------------------------------
    # TITLE
    # -----------------------------------------------------

    draw.text(
        (WIDTH // 2, 24),
        "CONTRIBUTION GRAND PRIX",
        fill=WHITE,
        anchor="ma"
    )

    draw.text(
        (WIDTH // 2, 48),
        "RAMAN VHANTALE  •  GITHUB ACTIVITY CIRCUIT",
        fill=GRAY,
        anchor="ma"
    )

    # -----------------------------------------------------
    # TRACK PANEL
    # -----------------------------------------------------

    rounded(
        draw,
        (
            25,
            75,
            WIDTH - 25,
            HEIGHT - 30
        ),
        18,
        PANEL,
        GRID,
        2
    )

    # -----------------------------------------------------
    # TRACK LINE
    # -----------------------------------------------------

    track_y = 205

    draw.line(
        (
            45,
            track_y,
            WIDTH - 45,
            track_y
        ),
        fill="#30363d",
        width=2
    )

    # -----------------------------------------------------
    # CONTRIBUTION GRID
    # -----------------------------------------------------

    draw_contribution_graph(
        draw,
        calendar,
        WIDTH,
        HEIGHT
    )

    # -----------------------------------------------------
    # START FINISH FLAG
    # -----------------------------------------------------

    flag_x = 50
    flag_y = 285

    for i in range(6):

        color = (
            WHITE
            if i % 2 == 0
            else RED
        )

        draw.rectangle(
            (
                flag_x + i * 9,
                flag_y,
                flag_x + (i + 1) * 9,
                flag_y + 9
            ),
            fill=color
        )

        draw.rectangle(
            (
                flag_x + i * 9,
                flag_y + 9,
                flag_x + (i + 1) * 9,
                flag_y + 18
            ),
            fill=(
                RED
                if i % 2 == 0
                else WHITE
            )
        )

    # -----------------------------------------------------
    # CAR POSITION
    # -----------------------------------------------------

    start_x = 150
    end_x = WIDTH - 160

    progress = frame_number / (
        total_frames - 1
    )

    # Smooth acceleration
    smooth = progress * progress * (
        3 - 2 * progress
    )

    car_x = (
        start_x
        + (end_x - start_x) * smooth
    )

    car_y = 205

    # -----------------------------------------------------
    # MOTION TRAILS
    # -----------------------------------------------------

    for offset in [70, 45, 25]:

        draw_f1_car(
            image,
            car_x - offset,
            car_y,
            1.0
        )

    # Main car

    draw_f1_car(
        image,
        car_x,
        car_y,
        1.0
    )

    # -----------------------------------------------------
    # FOOTER
    # -----------------------------------------------------

    total = calendar["totalContributions"]

    draw.text(
        (
            WIDTH // 2,
            HEIGHT - 12
        ),
        f"{total:,} contributions  •  DARK GREEN CIRCUIT  •  KEEP CODING",
        fill=GRAY,
        anchor="ms"
    )

    return image.convert(
        "P",
        palette=Image.Palette.ADAPTIVE
    )


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

def main():

    calendar = get_contribution_data()

    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    total_frames = 40

    frames = []

    for frame in range(total_frames):

        print(
            f"Generating frame "
            f"{frame + 1}/{total_frames}"
        )

        frames.append(
            create_frame(
                calendar,
                frame,
                total_frames
            )
        )

    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=70,
        loop=0,
        optimize=True,
        disposal=2
    )

    print(
        f"\nGenerated: {OUTPUT}"
    )


if __name__ == "__main__":
    main()
