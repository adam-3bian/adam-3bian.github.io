---
title: AI has compressed the attack timeline
image_url: /assets/news/ai-has-compressed-the-attack-timeline/a029b4887ff4-hero.jpg
published_date: '2026-04-14'
authors:
- mike-eftimakis
related:
  groups: []
  organisations:
  - google
  hardware: []
  software:
  - freebsd
  papers: []
---

# AI has compressed the attack timeline

This article is part of a series of blogs published after the announcement of Mythos vulnerabilities’ exploitation capabilities. The views from other experts on this topic are:

- CHERI memory safety mitigates LLM-discovered vulnerability in [FreeBSD](/software/freebsd/) – [Brooks Davis](/people/brooks-davis/)
- One Bug is All It Takes – [Adam Finney](/people/adam-finney/)

## Security by Design can’t wait!

Recent news around advanced AI models has made one thing unmistakably clear: the pace of cyber exploitation has crossed a critical threshold. AI has reduced time-to-exploit so much that patching alone is no longer enough: we need security by design.

Anthropic recently confirmed that its new AI model, Claude Mythos Preview, is so capable at identifying and exploiting software vulnerabilities that the company has chosen not to release it publicly, instead sharing it only with selected technology partners under its “Project Glasswing” initiative to give defenders a head start.

That decision alone should give pause. But what is more concerning is this: we no longer need frontier, unreleased models for attackers to gain a decisive advantage.

## AI accelerates exploitation

New research by Buzz, a Sequoia-backed cybersecurity startup, demonstrates that existing, publicly available AI models are already sufficient to automate sophisticated exploitation at scale. By chaining together models from Anthropic, OpenAI, and [Google](/organisations/google/) into an autonomous agent, the researchers managed to get AI to exploit known exploited vulnerabilities (KEVs, flaws that are publicly documented by authorities like CISA specifically so organizations can patch them) in a record time.

For defenders, this exposes a structural asymmetry as patching remains labor-intensive, risky, and slow, often taking days or weeks.

In short: AI has compressed the time-to-exploit below the human time-to-patch.

## Why “patch faster” is no longer a strategy

For decades, cybersecurity has relied on a reactive loop:

- discover → disclose → patch → deploy
- That loop assumed attackers needed time, skill, and scale. AI breaks all three assumptions.

The vulnerability window has collapsed! AI agents do not get tired. They do not wait for working hours. And once a vulnerability is public, they can weaponize it repeatedly, automatically, and in parallel. Attackers are now default early adopters of AI, while defenders remain risk-averse by necessity.

This does not mean patching is unimportant. But it can no longer be the primary control.

## The new enterprise reality: AI everywhere, data everywhere

At the same time, enterprises are moving rapidly toward agentic architectures, where AI systems are given broader autonomy and deeper access to data. AI agents, internal or external, start to access and act on enterprise data across applications in real time.

This reflects a broader trend: AI agents are becoming persistent actors inside enterprise systems, not just chat-based assistants. That makes systemic weaknesses far more dangerous. If a single compromised service grants lateral movement, AI enables attackers to exploit it faster and more thoroughly than ever before.

As Anthropic itself has acknowledged, models like Mythos are a preview of capabilities that will inevitably proliferate. Controlling model access may buy time—but it does not change the trajectory.

## Security by Design is the only scalable response

In this environment, defenders must assume:

- Vulnerabilities will be discovered and exploited quickly
- Attackers will use AI by default
- Reactive defences will always lag
- That shifts the focus from finding and fixing bugs to limiting the consequences when bugs exist.

This is the core principle behind security by design:

- Strong isolation between components
- Fine-grained memory safety
- Hardware-enforced compartmentalization
- Architectures that prevent a single flaw from becoming a systemic failure
- Segmentation, preventing a breach in one application from compromising others, is no longer optional. It is foundational.
- Unfortunately, software implementation of these principles often suffers from unacceptable performance impact and weak protection mechanisms.

This is precisely where CHERI-enabled systems matter. By enforcing memory safety and strong compartment boundaries in hardware, CHERI reduces entire classes of vulnerabilities and sharply limits what an automated attacker can achieve—even when a bug exists.

## A narrow window for action

The uncomfortable truth is this: the gap between attacker capability and defender response is widening, not narrowing.

Anthropic’s caution with Mythos is responsible. But the threat is already here. Enterprise software platforms are accelerating AI adoption. Governments are publishing vulnerability disclosures faster than humans can respond. And AI agents are learning how to exploit all of it.

We still have a window to act—but only if we move upstream, embedding security into architectures rather than layering it on afterward.

Security by design is no longer a long-term aspiration. It is the only strategy that scales in an AI-first world.
