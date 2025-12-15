#!/usr/bin/env node
/**
 * Build docs/licenses/index.md for GitHub Pages consumption.
 * - Embeds project license
 * - Lists available license texts and NOTICE files
 * - Copies THIRD-PARTY-LICENSES.md into docs/licenses for web access
 *
 * 
 * - docs/licenses を走査して index.md を自動生成（追加されたテキスト/NOTICE が自動で反映される）
 * - ルートの THIRD-PARTY-LICENSES.md / licenses.json も docs 配下にコピーして Pages で閲覧可能にする
 */
import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join("docs", "licenses");
const LICENSE_TEXTS_DIR = path.join(DOCS_DIR, "texts");
const NOTICES_DIR = path.join(DOCS_DIR, "notices");
const INDEX_PATH = path.join(DOCS_DIR, "index.md");
const INDEX_HTML_PATH = path.join(DOCS_DIR, "index.html");
const ATTRIBUTION_PATH = path.join(DOCS_DIR, "ATTRIBUTION.md");
const ROOT_THIRD_PARTY = "THIRD-PARTY-LICENSES.md";
const DOCS_THIRD_PARTY = path.join(DOCS_DIR, "THIRD-PARTY-LICENSES.md");
const ROOT_LICENSES_JSON = "licenses.json";
const DOCS_LICENSES_JSON = path.join(DOCS_DIR, "licenses.json");
const PROJECT_LICENSE_PATH = "LICENSE";
const PUBLIC_LICENSES_DIR = path.join("public", "licenses");

fs.mkdirSync(LICENSE_TEXTS_DIR, { recursive: true });
fs.mkdirSync(NOTICES_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_LICENSES_DIR, { recursive: true });

// 存在する場合のみ中身を返す（末尾改行は削る）
const readIfExists = (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8").trimEnd() : "");

const escapeHtml = (str) =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

// THIRD-PARTY-LICENSES.md を docs にコピー（Pages から閲覧できるように）
if (fs.existsSync(ROOT_THIRD_PARTY)) {
    fs.copyFileSync(ROOT_THIRD_PARTY, DOCS_THIRD_PARTY);
}

// licenses.json もコピーして監査用の生データを公開
if (fs.existsSync(ROOT_LICENSES_JSON)) {
    fs.copyFileSync(ROOT_LICENSES_JSON, DOCS_LICENSES_JSON);
}

// docs/licenses/texts 以下のライセンス本文を列挙
const licenseTextFiles = fs
    .readdirSync(LICENSE_TEXTS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".txt"))
    .sort();

// NOTICE 一覧も列挙
const noticeFiles = fs
    .readdirSync(NOTICES_DIR)
    .filter((f) => f.toLowerCase().endsWith(".txt"))
    .sort();

const projectLicenseText = readIfExists(PROJECT_LICENSE_PATH); // 自身の LICENSE を埋め込むために読む

const lines = [];
lines.push("# Licenses");
lines.push("");
lines.push("## This Project");
lines.push("This project is licensed under MIT.");
lines.push("");

if (projectLicenseText) {
    lines.push("<details>");
    lines.push("<summary>MIT License (full text)</summary>");
    lines.push("");
    lines.push("```text");
    lines.push(projectLicenseText);
    lines.push("```");
    lines.push("</details>");
    lines.push("");
}

lines.push("## Third-Party Summary");
if (fs.existsSync(DOCS_THIRD_PARTY)) {
    lines.push("- Third-party list: [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md)");
}
if (fs.existsSync(DOCS_LICENSES_JSON)) {
    lines.push("- Raw scan: [licenses.json](licenses.json)");
}
lines.push("");

lines.push("## License Texts");
if (licenseTextFiles.length === 0) {
    lines.push("- No license texts found in docs/licenses/texts.");
} else {
    for (const file of licenseTextFiles) {
        const id = path.basename(file, ".txt");
        const content = readIfExists(path.join(LICENSE_TEXTS_DIR, file));
        lines.push("<details>");
        lines.push(`<summary>${id}</summary>`);
        lines.push("");
        lines.push("```text");
        lines.push(content);
        lines.push("```");
        lines.push("</details>");
        lines.push("");
    }
}

lines.push("## Notices");
if (noticeFiles.length === 0) {
    lines.push("- No NOTICE files required.");
} else {
    for (const file of noticeFiles) {
        const label = file.replace(/\\.NOTICE\\.txt$/i, "");
        const content = readIfExists(path.join(NOTICES_DIR, file));
        lines.push("<details>");
        lines.push(`<summary>${label}</summary>`);
        lines.push("");
        lines.push("```text");
        lines.push(content);
        lines.push("```");
        lines.push("</details>");
        lines.push("");
    }
}

if (fs.existsSync(ATTRIBUTION_PATH)) {
    lines.push("## Attribution");
    lines.push("- See [ATTRIBUTION.md](ATTRIBUTION.md) for CC-BY credits.");
    lines.push("");
}

fs.writeFileSync(INDEX_PATH, `${lines.join("\n")}\n`);
console.log(`[docs] Wrote ${INDEX_PATH}`);

// HTML 版も生成（/licenses/index.html で表示用）
const html = [];
html.push("<!doctype html>");
html.push('<html lang="en">');
html.push("<head>");
html.push('  <meta charset="utf-8" />');
html.push("  <title>Licenses</title>");
html.push("  <style>");
html.push("    :root { color-scheme: light dark; }");
html.push("    body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; line-height: 1.6; padding: 24px; }");
html.push("    h1, h2 { margin-top: 0; }");
html.push("    details { border: 1px solid #ccc; border-radius: 6px; padding: 10px 12px; background: rgba(0,0,0,0.02); margin-bottom: 12px; }");
html.push("    summary { font-weight: 600; cursor: pointer; }");
html.push("    pre { white-space: pre-wrap; word-break: break-word; background: rgba(0,0,0,0.03); padding: 12px; border-radius: 6px; }");
html.push("    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; }");
html.push("    ul { padding-left: 20px; }");
html.push("  </style>");
html.push("</head>");
html.push("<body>");
html.push("  <h1>Licenses</h1>");
html.push("  <section>");
html.push("    <h2>This Project</h2>");
html.push("    <p>This project is licensed under MIT.</p>");
if (projectLicenseText) {
    html.push("    <details open>");
    html.push("      <summary>MIT License (full text)</summary>");
    html.push("      <pre><code>");
    html.push(escapeHtml(projectLicenseText));
    html.push("      </code></pre>");
    html.push("    </details>");
}
html.push("  </section>");
html.push("");
html.push("  <section>");
html.push("    <h2>Third-Party Summary</h2>");
const summaryLinks = [];
if (fs.existsSync(DOCS_THIRD_PARTY)) {
    summaryLinks.push('<a href="./THIRD-PARTY-LICENSES.md">THIRD-PARTY-LICENSES.md</a>');
}
if (fs.existsSync(DOCS_LICENSES_JSON)) {
    summaryLinks.push('<a href="./licenses.json">licenses.json</a>');
}
if (summaryLinks.length > 0) {
    html.push("    <ul>");
    for (const link of summaryLinks) {
        html.push(`      <li>${link}</li>`);
    }
    html.push("    </ul>");
} else {
    html.push("    <p>No third-party summary files found.</p>");
}
html.push("  </section>");
html.push("");
html.push("  <section>");
html.push("    <h2>License Texts</h2>");
if (licenseTextFiles.length === 0) {
    html.push("    <p>No license texts found in docs/licenses/texts.</p>");
} else {
    for (const file of licenseTextFiles) {
        const id = path.basename(file, ".txt");
        const content = readIfExists(path.join(LICENSE_TEXTS_DIR, file));
        html.push("    <details>");
        html.push(`      <summary>${escapeHtml(id)}</summary>`);
        html.push("      <pre><code>");
        html.push(escapeHtml(content));
        html.push("      </code></pre>");
        html.push("    </details>");
    }
}
html.push("  </section>");
html.push("");
html.push("  <section>");
html.push("    <h2>Notices</h2>");
if (noticeFiles.length === 0) {
    html.push("    <p>No NOTICE files required.</p>");
} else {
    for (const file of noticeFiles) {
        const label = file.replace(/\\.NOTICE\\.txt$/i, "");
        const content = readIfExists(path.join(NOTICES_DIR, file));
        html.push("    <details>");
        html.push(`      <summary>${escapeHtml(label)}</summary>`);
        html.push("      <pre><code>");
        html.push(escapeHtml(content));
        html.push("      </code></pre>");
        html.push("    </details>");
    }
}
html.push("  </section>");
if (fs.existsSync(ATTRIBUTION_PATH)) {
    html.push("  <section>");
    html.push("    <h2>Attribution</h2>");
    html.push('    <p><a href="./ATTRIBUTION.md">ATTRIBUTION.md</a></p>');
    html.push("  </section>");
}
html.push("</body>");
html.push("</html>");

fs.writeFileSync(INDEX_HTML_PATH, `${html.join("\n")}\n`);
console.log(`[docs] Wrote ${INDEX_HTML_PATH}`);

// 公開用に public/licenses にもコピー（SPA から /#/licenses で読み込み）
const copyIfExists = (src, dest) => {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
};
const copyDirIfExists = (src, dest) => {
    if (!fs.existsSync(src)) return;
    fs.cpSync(src, dest, { recursive: true });
};

copyIfExists(INDEX_PATH, path.join(PUBLIC_LICENSES_DIR, "index.md"));
copyIfExists(INDEX_HTML_PATH, path.join(PUBLIC_LICENSES_DIR, "index.html"));
copyIfExists(DOCS_THIRD_PARTY, path.join(PUBLIC_LICENSES_DIR, "THIRD-PARTY-LICENSES.md"));
copyIfExists(DOCS_LICENSES_JSON, path.join(PUBLIC_LICENSES_DIR, "licenses.json"));
copyIfExists(ATTRIBUTION_PATH, path.join(PUBLIC_LICENSES_DIR, "ATTRIBUTION.md"));
copyDirIfExists(LICENSE_TEXTS_DIR, path.join(PUBLIC_LICENSES_DIR, "texts"));
copyDirIfExists(NOTICES_DIR, path.join(PUBLIC_LICENSES_DIR, "notices"));
