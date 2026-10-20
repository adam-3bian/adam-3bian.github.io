---
layout: details/post
title: SCI Semiconductor and the CHERI Alliance at RISC-V Summit in China, July 2025
summary: In the latter half of July I got the fantastic opportunity to re-visit Shanghai after a good few years of being away and wow, have I missed it. Shanghai is a fantastic city to visit and has grown so much over the last 20 years. It is therefore a fitting location and analogous to the growth of RISC-V celebrating its own 15th year anniversary.
permalink: /news/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/
slug: sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025
navigation:
  header:
    category: News & Events
    subcategory: News & Analysis
image:
  src: /assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/e37a8017-d01a1b459692-hero.jpg
  alt: RISC-V Summit welcome board
  width: 1379
  height: 1034
date: '2025-09-08T10:50:02+01:00'
post:
  category: cheri-alliance-news
  tags:
  - CHERI Alliance news
---

## Overview

Andy Frame –

[SCI Semiconductor](/organisations/sci-semiconductor/)

The reason for this trip was to exhibit at the 5th China RISC-V Summit and represent [SCI Semiconductor](/organisations/sci-semiconductor/), the [CHERI Alliance](/), and the CHERIoT-Ibex open-source project jointly maintained by Google, Microsoft and SCI Semiconductor. In collaboration with the fantastic teams at both SOPIC and VeriSilicon, SCI Semi had the opportunity to present a comprehensive half-day CHERI Memory Safety workshop, and promote the technology at an impressive booth on the exhibit floor.

![SCI Semiconductor booth with people](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/21db7018-93d639039375-sci-semiconductor-booth-with-people.jpg){: .image-full }

![SCI Semiconductor Banner with information about CHERI](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/2d45ea34-a59ec32de96f-sci-semiconductor-banner-with-information-about-cheri.jpg){: .image-full }

![SCI Semiconductor booth](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/76fce1ce-3612ad4b48e4-sci-semiconductor-booth.jpg){: .image-full }

The 5th RISC-V summit was the biggest and most successful so far with over 4,000 in-person attendees from 17 countries, and a whopping 250K+ viewers attending the live streaming.

The two-day summit had keynotes from some key individuals and companies including:

- [**Andrea Gallo**](https://www.linkedin.com/in/agallo70/), CEO, RISC-V International
- [**Krste Asanovic**](https://www.linkedin.com/in/krste-asanovic/), Chief Architect, RISC-V International, Co-creator RISC-V, and SiFive
- [**Leendert van Doorn**](https://www.linkedin.com/in/leendert-van-doorn-740170/), Senior Vice President, Qualcomm
- [**Frans Sijstermans**](https://www.linkedin.com/in/frans-sijstermans-11621/), VP of Hardware Engineering, NVIDIA
- [**Wei-Han Lien**](https://www.linkedin.com/in/wlien/), Chief Architect and Senior Fellow, Tenstorrent, and
- [**Thomas SCHNEID**](https://www.linkedin.com/in/thomasschneid/), Head of Software Partnership, Infineon

The full set of recordings from the event will soon be available on the RISC-V YouTube Channel [https://www.youtube.com/@RISCVInternational](https://www.youtube.com/@RISCVInternational), where you can also find all of the recordings from many of the previous RISC-V Summits.

We had a super busy time at our booth with lots of visitors eager to know more about ICENI™, the [SCI Semiconductor](/organisations/sci-semiconductor/) family of CHERI-enabled microcontrollers with hardware-enforced memory safety, which will be available later this year. This was along with some great questions about CHERI, CHERIoT, and memory safety.  You can find out more about ICENI [here](https://www.scisemi.com/products/iceni-device-family/) and look out for a future deep dive blog here on the [CHERI Alliance website](/).

For the first time the China conference event was preceded by a tutorial day where SCI Semi presented to a packed room and eager audience on cyber security challenges, and the CHERI background, technology, opportunity, and growth. The introduction was followed by an interactive practical session on how to implement compartmentalisation as enabled by CHERIoT-RTOS.

![CHERI Tutorial slide](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/b9b0ef0e-e33736ec8b38-afb4-1.jpg){: .image-full }

![Haydn Povey presenting](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/8b5138f9-59b22363f2af-afb5.jpg){: .image-full }

The practical session was similar to one that can be found on the CHERIoT GitHub site at [https://github.com/CHERIoT-Platform/cheriot-rtos/tree/main/exercises/01.compartmentalisation](https://github.com/CHERIoT-Platform/cheriot-rtos/tree/main/exercises/01.compartmentalisation). This exercise starts from a firmware image that simulates a bug that gives an attacker arbitrary-code execution. It reads JavaScript programs (as compiled bytecode) from the UART and executes them. The JavaScript has a set of FFI functions exposed that allow arbitrary capability manipulation, including pointer chasing. This simulates an attacker building a code-reuse attack, with a lot more power than is normally possible on a CHERI system. The goal of the exercise was to show how, by applying compartmentalisation, we can limit the damage that an attacker can do.

![Practical session with participants](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/11327031-199829da2761-practical-session-with-participants.jpg){: .image-full }

The CHERIoT (CHERI for IoT) platform was originally developed at Microsoft and is now part of an effort spanning multiple companies. It builds on top of CHERI to provide a solid foundation for secure embedded devices. Whilst CHERI provides referential integrity (pointers cannot be forged), spatial memory safety (pointers carry bounds that cannot be extended), call gates, and so on, CHERIoT extends this with a complete platform providing deterministic use-after-free protection, a lightweight compartment model, lexically-scoped delegation of objects across compartment calls, and many more benefits. (Source [https://cheriot.org/](https://cheriot.org/))

![CHERIoT Platform GitHub page](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/9be1b84f-4b07d130970c-cheriot-platform-github-page.png){: .image-full }

More details on CHERIoT can be found at [https://cheriot.org/](https://cheriot.org/) along with the latest version of CHERIoT Programmers’ Guide authored by David Chisnall, Director of Systems Architecture at SCI Semi, and one of the inventors of CHERIoT.

The Microsoft background Technical Report can be found here: [https://www.microsoft.com/en-us/research/wp-content/uploads/2023/02/cheriot-63e11a4f1e629.pdf](https://www.microsoft.com/en-us/research/wp-content/uploads/2023/02/cheriot-63e11a4f1e629.pdf)

To finish off a wonderful event, we were invited to join the organizing team on a Huangpu River Cruise Dinner for some great food, drink and networking, on a slightly drizzly evening, where I took my latest favourite wallpaper image.

![Shanghai skyline](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/32564fd2-e739a07e0647-shanghai-skyline.jpg){: .image-full }

Many thanks to SOPIC and the fantastic team at [VeriSilicon](/organisations/verisilicon/) for their support throughout the whole event, and for a final shot of the nighttime Shanghai skyline.

![Shanghai skyline](/assets/images/news-and-events/news-and-analysis/sci-semiconductor-and-the-cheri-alliance-at-risc-v-summit-in-china-july-2025/1ea86da5-718c52c29d70-shanghai-skyline-2.jpg){: .image-full }

Official Image library (be warned there’s hundreds of pictures):

[https://live.photoplus.cn/live/99270474?accessFrom=live\#/list](https://live.photoplus.cn/live/99270474?accessFrom=live#/list)

Additional blogs:

[https://riscv.org/blog/2025/07/risc-v-summit-china-2025-reflections-from-a-risc-v-software-contributor/](https://riscv.org/blog/2025/07/risc-v-summit-china-2025-reflections-from-a-risc-v-software-contributor/)

[Back to Latest News](/news-and-events/news-and-analysis/latest-news/)
