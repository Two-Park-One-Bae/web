"""Combine released main pages and a develop preview using only public site files."""

import argparse
import re
import shutil
from pathlib import Path


SITE_FILES = (
    "index.html", "404.html", "styles.css", "landing.css", "CNAME",
    ".nojekyll", "robots.txt", "sitemap.xml",
)
SITE_DIRECTORIES = ("assets", "terms", "privacy", "support", "download")


def copy_site(source, target):
    target.mkdir(parents=True)
    for name in SITE_FILES:
        path = source / name
        if path.is_file():
            shutil.copy2(path, target / name)
    for name in SITE_DIRECTORIES:
        path = source / name
        if path.is_dir():
            shutil.copytree(path, target / name)
    if not (target / "index.html").is_file():
        raise ValueError(f"Missing index.html in {source}")


def build(production, development, output):
    if output.exists():
        raise ValueError("Output must be a new directory")
    copy_site(production, output)
    preview = output / "develop"
    copy_site(development, preview)
    # A subdirectory must not declare a second Pages domain or production sitemap.
    for name in ("CNAME", "sitemap.xml"):
        (preview / name).unlink(missing_ok=True)
    (preview / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
    banner = (
        '<aside aria-label="개발용 페이지 안내" '
        'style="padding:10px 16px;text-align:center;background:#fff3cd;'
        'color:#624a00;font:14px/1.5 system-ui">'
        '개발용 미리보기 · 출시된 서비스와 내용이 다를 수 있습니다. '
        '<a href="/" style="color:inherit;text-decoration:underline">운영 사이트 보기</a>'
        '</aside>'
    )
    for page in preview.rglob("*.html"):
        html = page.read_text()
        html = re.sub(
            r'<meta\b[^>]*\bname=["\']robots["\'][^>]*>',
            "", html, flags=re.IGNORECASE,
        )
        html = re.sub(
            r"(<head\b[^>]*>)", r'\1\n<meta name="robots" content="noindex, nofollow">',
            html, count=1, flags=re.IGNORECASE,
        )
        html = re.sub(
            r"(<body\b[^>]*>)", lambda match: match[0] + banner,
            html, count=1, flags=re.IGNORECASE,
        )
        page.write_text(html)
    # Only the root robots.txt controls crawlers; preserve main's rules as a group.
    robots = output / "robots.txt"
    rules = robots.read_text() if robots.exists() else ""
    robots.write_text("User-agent: *\nDisallow: /develop/\n\n" + rules)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--main", type=Path, required=True)
    parser.add_argument("--develop", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build(args.main, args.develop, args.output)
