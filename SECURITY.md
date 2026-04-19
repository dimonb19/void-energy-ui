# Security Policy

DGRS Labs Pte. Ltd. takes the security of Void Energy UI seriously. We appreciate responsible disclosure from researchers and users who help keep the project and its downstream consumers safe.

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security-sensitive reports.**

Report suspected vulnerabilities privately via one of these channels:

1. **Email:** security@dgrslabs.com
2. **GitHub Private Vulnerability Reporting:** [open a private advisory](https://github.com/dimonb19/void-energy-ui/security/advisories/new)

### What to Include

To help us triage quickly, include where possible:

- A clear description of the issue and its impact
- The affected package, version, and file(s)
- Steps to reproduce (proof-of-concept code, URLs, or a minimal repro repo)
- Any known mitigations or workarounds
- Your name and contact details if you would like to be credited

---

## Response Process

- **Acknowledgement:** We aim to acknowledge receipt within **3 business days**.
- **Initial assessment:** A triage update with severity and expected timeline within **10 business days**.
- **Coordinated disclosure:** We work with reporters to agree on a disclosure window before any public advisory or patch release.
- **Fix and release:** Patches are shipped as a new version with a GitHub Security Advisory and CVE where applicable.

We follow **coordinated disclosure**. Please give us a reasonable window to investigate and release a fix before publishing details. We will credit reporters in the advisory unless you prefer to remain anonymous.

---

## Supported Versions

During the 0.x development phase, only the **latest minor release** receives security fixes. Once Void Energy UI reaches 1.0, we will document an extended support window here.

| Version | Supported |
| ------- | --------- |
| Latest 0.x release | ✅ |
| Older 0.x releases | ❌ |

---

## Scope

**In scope:**

- Code in this repository (`src/`, `packages/`, `scripts/`, build tooling)
- Published npm packages under `@dgrslabs/void-energy-*`
- The showcase site if hosted by DGRS Labs

**Out of scope:**

- Third-party dependencies — report those upstream. If a dependency vulnerability affects us materially, we will track and patch it, but please report the root cause to the upstream maintainer.
- Social engineering, physical attacks, or denial-of-service testing against DGRS Labs infrastructure.
- Consumer applications that embed Void Energy UI — report those to the respective application owner.

---

## Safe Harbor

We consider security research conducted in good faith under this policy to be:

- Authorized activity under applicable computer-crime laws, to the extent we can grant such authorization
- Exempt from DMCA claims for circumvention of technical measures used to protect the Licensed Work
- Not a violation of our License or Terms of Service, provided the research stays within the scope above and does not intentionally harm users or infrastructure

If legal action is initiated by a third party against you for activities conducted in compliance with this policy, we will make it known that your actions were authorized.

---

## Questions

Non-sensitive questions about this policy can be sent to security@dgrslabs.com or raised as a regular GitHub issue.
