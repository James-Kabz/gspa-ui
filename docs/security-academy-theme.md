# Security Academy visual system

The default GSPA UI theme translates the Security Academy specification into a professional learning interface. It is designed to feel authoritative, calm, practical, and globally credible—not like a generic LMS or a neon “hacker” product.

## Visual direction

- **Institutional navy** anchors navigation, primary actions, headings, and high-trust surfaces.
- **Credential gold** is used sparingly for focus, achievement, certification, and premium emphasis.
- **Cool neutral surfaces** keep dashboards, course content, assessments, and administrative screens readable for long sessions.
- **Compact uppercase labels** identify metadata, security domains, classifications, and workflow stages.
- **Moderate corners and restrained shadows** create hierarchy without making professional tools feel playful.
- **Dark mode** uses deep navy surfaces with gold actions, avoiding pure black and high-saturation cyberpunk colors.

## Semantic use

| Purpose | Token or class | Intended use |
| --- | --- | --- |
| Primary | `--ui-primary`, `.ui-primary-bg` | Navigation state, primary CTA, active learning step |
| Credential | `--ui-credential`, `.ui-credential` | Certificates, verified achievements, completion moments |
| Cybersecurity | `--ui-cyber`, `.ui-domain-cyber` | Cyber courses, labs, packet/log/forensics activities |
| Physical security | `--ui-physical`, `.ui-domain-physical` | Facility, CCTV, access-control, and risk scenarios |
| Success | `--ui-success`, `.ui-success-soft` | Optimal outcomes, passed assessments, completed work |
| Warning | `--ui-warning`, `.ui-warning-soft` | Partially acceptable outcomes, due work, elevated risk |
| Danger | `--ui-danger`, `.ui-danger-soft` | Unsafe outcomes, failed validation, destructive actions |
| Metadata | `.ui-eyebrow` | Domain, level, duration, version, classification |
| Display heading | `.ui-display-title` | Page and course titles |

Gold should not replace semantic warning or success colors. Reserve it for brand emphasis and credentials so those moments remain distinctive.

## Product patterns

- Course cards lead with domain, level, duration, learning progress, and the next useful action.
- Learning screens favor a stable content column, persistent progress, clear module hierarchy, and minimal distraction.
- Scenario screens distinguish briefing, evidence, decision, feedback, and score as separate visual regions.
- Assessment outcomes use `Optimal`, `Acceptable`, `Partially Acceptable`, and `Unsafe` with text labels as well as color.
- Administrative tables remain dense and precise, with strong headers, subtle row boundaries, and visible audit/status metadata.
- Certificate screens may use more gold than routine screens, but retain navy typography and generous whitespace.

## Theme API

The Academy preset is the default:

```js
import { initTheme, setTheme } from '@gspa/ui'

initTheme({ defaultMode: 'light' })
setTheme({ preset: 'academy' })
```

Consumer-supplied organization palettes remain supported through `setTheme`. Light and dark modes calculate appropriate soft surfaces and foreground contrast independently.
