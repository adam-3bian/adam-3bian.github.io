---
title: SCI Semiconductor and the CHERI Alliance at RISC-V Summit in China, July 2025
image_url: /assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/d01a1b459692-hero.jpg
published_date: '2025-09-08'
authors: []
related:
  working-groups: []
  organisations:
  - risc-v-international
  - sci-semiconductor
  - cheri-alliance
  - verisilicon
  - google
  hardware:
  - cheriot-ibex
  - cheriot
  software: []
  academic-papers: []
---

# SCI Semiconductor and the CHERI Alliance at RISC-V Summit in China, July 2025

Andy Frame –

[SCI Semiconductor](/organisations/sci-semiconductor/)

In the latter half of July I got the fantastic opportunity to re-visit Shanghai after a good few years of being away and wow, have I missed it. Shanghai is a fantastic city to visit and has grown so much over the last 20 years. It is therefore a fitting location and analogous to the growth of RISC-V celebrating its own 15th year anniversary.

The reason for this trip was to exhibit at the 5th China RISC-V Summit and represent SCI Semiconductor, the [CHERI Alliance](/organisations/cheri-alliance/), and the [CHERIoT-Ibex](/hardware/cheriot-ibex/) open-source project jointly maintained by [Google](/organisations/google/), Microsoft and SCI Semiconductor. In collaboration with the fantastic teams at both SOPIC and [VeriSilicon](/organisations/verisilicon/), SCI Semi had the opportunity to present a comprehensive half day CHERI Memory Safety workshop, and promote the technology at an impressive booth on the exhibit floor.

<ul class="image-gallery" markdown="block">
<li markdown="block">

![SCI Semiconductor booth with people](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/93d639039375-sci-semiconductor-booth-with-people.jpg)

</li>
<li markdown="block">

![SCI Semiconductor Banner with information about CHERI](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/a59ec32de96f-sci-semiconductor-banner-with-information-about-cheri.jpg)

</li>
<li markdown="block">

![SCI Semiconductor booth](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/3612ad4b48e4-sci-semiconductor-booth.jpg)

</li>
</ul>

The 5th RISC-V summit was the biggest and most successful so far with over 4,000 in-person attendees from 17 countries, and a whopping 250K+ viewers attending the live streaming.

The two-day summit had keynotes from some key individuals and companies including:

- Andrea Gallo, CEO, [RISC-V International](/organisations/risc-v-international/)
- Krste Asanovic, Chief Architect, RISC-V International, Co-creator RISC-V, and SiFive
- Leendert van Doorn, Senior Vice President, Qualcomm
- Frans Sijstermans, VP of Hardware Engineering, NVIDIA
- Wei-Han Lien, Chief Architect and Senior Fellow, Tenstorrent, and
- Thomas SCHNEID, Head of Software Partnership, Infineon

The full set of recordings from the event will soon be available on the RISC-V YouTube Channel <https://www.youtube.com/@RISCVInternational>, where you can also find all of the recordings from many of the previous RISC-V Summits.

We had a super busy time at our booth with lots of visitors eager to know more about ICENI™, the SCI Semiconductor family of CHERI-enabled microcontrollers with hardware enforced memory safety, which will be available later this year. This was along with some great questions about CHERI, [CHERIoT](/hardware/cheriot/), and memory safety. You can find out more about ICENI here and look out for a future deep dive blog here on the CHERI Alliance website.

For the first time the China conference event was preceded by a tutorial day where SCI Semi presented to a packed room and eager audience on cyber security challenges, and the CHERI background, technology, opportunity, and growth. The introduction was followed by an interactive practical session on how to implement compartmentalisation as enabled by CHERIoT-RTOS.

<ul class="image-gallery" markdown="block">
<li markdown="block">

![afb4 1](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/e33736ec8b38-afb4-1.jpg)

</li>
<li markdown="block">

![CHERI tutorial session](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/59b22363f2af-afb5.jpg)

</li>
</ul>

The practical session was similar to one that can be found on the CHERIoT GitHub site at <https://github.com/CHERIoT-Platform/cheriot-rtos/tree/main/exercises/01.compartmentalisation>. This exercise starts from a firmware image that simulates a bug that gives an attacker arbitrary-code execution. It reads JavaScript programs (as compiled bytecode) from the UART and executes them. The JavaScript has a set of FFI functions exposed that allow arbitrary capability manipulation, including pointer chasing. This simulates an attacker building a code-reuse attack, with a lot more power than is normally possible on a CHERI system. The goal of the exercise was to show how, by applying compartmentalisation, we can limit the damage that an attacker can do.

![Practical session with participants](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/199829da2761-practical-session-with-participants.jpg){: .image-left }

The CHERIoT (CHERI for IoT) platform was originally developed at Microsoft and is now part of an effort spanning multiple companies. It builds on top of CHERI to provide a solid foundation for secure embedded devices. Whilst CHERI provides referential integrity (pointers cannot be forged), spatial memory safety (pointers carry bounds that cannot be extended), call gates, and so on, CHERIoT extends this with a complete platform providing deterministic use-after-free protection, a lightweight compartment model, lexically-scoped delegation of objects across compartment calls, and many more benefits. (Source <https://cheriot.org/>)

![CHERIoT Platform GitHub page](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/4b07d130970c-cheriot-platform-github-page.png){: .image-full }

More details on CHERIoT can be found at <https://cheriot.org/> along with the latest version of CHERIoT Programmers’ Guide authored by [David Chisnall](/people/david-chisnall/), Director of Systems Architecture at SCI Semi, and one of the inventors of CHERIoT.

The Microsoft background Technical Report can be found here: <https://www.microsoft.com/en-us/research/wp-content/uploads/2023/02/cheriot-63e11a4f1e629.pdf>

To finish of a wonderful event, we were invited to join the organizing team on a Huangpu River Cruise Dinner for some great food, drink and networking, on a slightly drizzly evening, where I took my latest favourite wallpaper image.

<ul class="image-gallery" markdown="block">
<li markdown="block">

![Shanghai skyline](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/e739a07e0647-shanghai-skyline.jpg)

Many thanks to SOPIC and the fantastic team at VeriSilicon for their support throughout the whole event, and for a final shot of the nighttime Shanghai skyline.

</li>
<li markdown="block">

![Shanghai skyline](/assets/news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/718c52c29d70-shanghai-skyline-2.jpg)

</li>
</ul>

Official Image library (be warned there’s hundreds of pictures):

<https://live.photoplus.cn/live/99270474?accessFrom=live#/list>

Additional blogs:

<https://riscv.org/blog/2025/07/risc-v-summit-china-2025-reflections-from-a-risc-v-software-contributor/>
