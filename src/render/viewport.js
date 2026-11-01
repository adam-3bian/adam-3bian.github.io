/** Resize is presentation state; it must never change the simulation. */
export class ViewportSizing {
    container;
    renderer;
    camera;
    maximumDimension;
    observer;
    frame = 0;
    scale = .5;
    last = '';
    disposed = false;
    schedule = () => { if (!this.disposed && !this.frame)
        this.frame = requestAnimationFrame(() => { this.frame = 0; this.resize(); }); };
    constructor(container, renderer, camera, maximumDimension = 8192) {
        this.container = container;
        this.renderer = renderer;
        this.camera = camera;
        this.maximumDimension = maximumDimension;
        window.addEventListener('resize', this.schedule);
        if (typeof ResizeObserver !== 'undefined') {
            this.observer = new ResizeObserver(this.schedule);
            this.observer.observe(container);
        }
        this.resize();
    }
    setScale(scale) { this.scale = Number.isFinite(scale) ? Math.max(.25, Math.min(1, scale)) : .5; this.resize(); }
    resize() {
        if (this.disposed)
            return;
        const w = Math.floor(this.container.clientWidth), h = Math.floor(this.container.clientHeight);
        // Hidden/minimised containers retain their last valid buffer until measurable.
        if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1)
            return;
        const ratio = Math.min(this.scale, this.maximumDimension / w, this.maximumDimension / h, Math.sqrt(16777216 / (w * h)));
        const key = `${w}/${h}/${ratio}`;
        if (key === this.last)
            return;
        this.renderer.setDrawingBufferSize(w, h, ratio);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.last = key;
    }
    dispose() { this.disposed = true; this.observer?.disconnect(); window.removeEventListener('resize', this.schedule); if (this.frame)
        cancelAnimationFrame(this.frame); this.frame = 0; }
}
