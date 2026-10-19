// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="cover.html">CHERI Roadmap for Linux</a></li><li class="chapter-item expanded "><a href="intro.html"><strong aria-hidden="true">1.</strong> Introduction</a></li><li class="chapter-item expanded "><a href="goals/index.html"><strong aria-hidden="true">2.</strong> Goals</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="goals/toolchain.html"><strong aria-hidden="true">2.1.</strong> Toolchain</a></li><li class="chapter-item expanded "><a href="goals/emulation-crossbuild.html"><strong aria-hidden="true">2.2.</strong> Emulation and crossbuild platforms</a></li><li class="chapter-item expanded "><a href="goals/kernel.html"><strong aria-hidden="true">2.3.</strong> Kernel support</a></li><li class="chapter-item expanded "><a href="goals/bootloaders-firmware.html"><strong aria-hidden="true">2.4.</strong> Bootloaders and firmware</a></li><li class="chapter-item expanded "><a href="goals/user-space.html"><strong aria-hidden="true">2.5.</strong> User space support</a></li><li class="chapter-item expanded "><a href="goals/distros.html"><strong aria-hidden="true">2.6.</strong> Linux distributions</a></li><li class="chapter-item expanded "><a href="goals/testing.html"><strong aria-hidden="true">2.7.</strong> Testing</a></li></ol></li><li class="chapter-item expanded "><a href="prior-work.html"><strong aria-hidden="true">3.</strong> Prior Work on Linux adaptation</a></li><li class="chapter-item expanded "><a href="techreports.html"><strong aria-hidden="true">4.</strong> Technical Reports</a></li><li class="chapter-item expanded "><a href="research.html"><strong aria-hidden="true">5.</strong> Selected CHERI research papers</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
