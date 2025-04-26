/**

 * Theme Control Add-On for Mojo Browser

 * Version: 1.0.0

 * Author: MojoX Team

 */

// @Name : Theme Control
(function () {
    "use strict";

    const DEFAULT_SETTINGS = {
        enabled: true,
        mode: "grayscale",
        grayscale: 100,
        contrast: 100,
        brightness: 100,
        saturation: 100,
        textContrast: false,
        fontSize: 16,
        colorInversion: false,
        animateTransitions: true,
        autoAdjust: true,
        perSite: {},
        reduceMotion: false,
        highPerformance: false,
    };

    let settings = JSON.parse(localStorage.getItem("blackWhiteThemeSettings")) || { ...DEFAULT_SETTINGS };
    let currentHost = window.location.hostname;
    let styleElement = null;
    let panel = null;
    let lastUpdate = 0;
    let isBrowserDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function saveSettings() {
        try {
            localStorage.setItem("blackWhiteThemeSettings", JSON.stringify(settings));
        } catch (e) {}
    }

    function getSiteSettings() {
        return settings.perSite[currentHost] || settings;
    }

    function saveSiteSettings(siteSettings) {
        settings.perSite[currentHost] = { ...siteSettings };
        saveSettings();
    }

    function applyStyles() {
        if (!settings.enabled) {
            removeStyles();
            return;
        }

        const siteSettings = getSiteSettings();
        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = "black-white-theme-style";
            document.head.appendChild(styleElement);
        }

        const adjustedGrayscale = settings.autoAdjust ? adjustGrayscaleForPage(siteSettings.grayscale) : siteSettings.grayscale;
        const transition = settings.animateTransitions && !isReducedMotion && !settings.reduceMotion ? "0.4s ease" : "0s";
        let css = `
            html {
                transition: filter ${transition} !important;
            }
        `;

        if (siteSettings.mode === "grayscale") {
            css += `
                html {
                    filter: grayscale(${adjustedGrayscale}%) saturate(${siteSettings.saturation}%) ${siteSettings.colorInversion ? "invert(100%)" : ""} !important;
                    -webkit-filter: grayscale(${adjustedGrayscale}%) saturate(${siteSettings.saturation}%) ${siteSettings.colorInversion ? "invert(100%)" : ""} !important;
                }
            `;
        } else if (siteSettings.mode === "sepia") {
            css += `
                html {
                    filter: sepia(${adjustedGrayscale}%) saturate(${siteSettings.saturation}%) ${siteSettings.colorInversion ? "invert(100%)" : ""} !important;
                    -webkit-filter: sepia(${adjustedGrayscale}%) saturate(${siteSettings.saturation}%) ${siteSettings.colorInversion ? "invert(100%)" : ""} !important;
                }
            `;
        } else if (siteSettings.mode === "high-contrast") {
            css += `
                html {
                    filter: contrast(${siteSettings.contrast}%) brightness(${siteSettings.brightness}%) saturate(${siteSettings.saturation}%) ${siteSettings.colorInversion ? "invert(100%)" : ""} !important;
                    -webkit-filter: contrast(${siteSettings.contrast}%) brightness(${siteSettings.brightness}%) saturate(${siteSettings.saturation}%) ${siteSettings.colorInversion ? "invert(100%)" : ""} !important;
                }
                img, video, picture, canvas {
                    filter: grayscale(100%) !important;
                    -webkit-filter: grayscale(100%) !important;
                }
            `;
        }

        if (siteSettings.textContrast) {
            css += `
                body, p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, textarea, select {
                    color: ${isBrowserDarkTheme ? "#fff !important" : "#000 !important"};
                    background: ${isBrowserDarkTheme ? "#000 !important" : "#fff !important"};
                    border-color: ${isBrowserDarkTheme ? "#fff !important" : "#000 !important"};
                    text-shadow: none !important;
                }
            `;
        }

        if (siteSettings.fontSize !== 16) {
            css += `
                body, p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, textarea, select {
                    font-size: ${siteSettings.fontSize}px !important;
                    line-height: ${siteSettings.fontSize * 1.5}px !important;
                }
            `;
        }

        styleElement.textContent = css;
        if (!settings.highPerformance) {
            requestAnimationFrame(() => lastUpdate = performance.now());
        }
    }

    function removeStyles() {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
    }

    function adjustGrayscaleForPage(baseGrayscale) {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = 1;
            canvas.height = 1;
            ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return Math.min(100, Math.max(0, baseGrayscale * (luminance < 0.5 ? 1.4 : 0.6)));
        } catch (e) {
            return baseGrayscale;
        }
    }

    function createControlPanel() {
        if (panel) return;

        panel = document.createElement("div");
        panel.id = "black-white-theme-panel";
        panel.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${isBrowserDarkTheme ? "#1c1c1e" : "#ffffff"};
            color: ${isBrowserDarkTheme ? "#e8ecef" : "#1a1a1a"};
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 10px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.1);
            z-index: 10002;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            width: 340px;
            max-height: 90vh;
            overflow-y: auto;
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
            transform: translateY(0);
            border: 1px solid ${isBrowserDarkTheme ? "#333" : "#e0e0e0"};
        `;

        const siteSettings = getSiteSettings();
        panel.innerHTML = `
            <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Theme Control</h3>
            <label style="display: flex; align-items: center; margin-bottom: 14px; cursor: pointer;">
                <input type="checkbox" id="theme-enabled" ${settings.enabled ? "checked" : ""} style="margin-right: 10px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
                Enable Theme
            </label>
            <label style="display: block; margin-bottom: 14px;">
                Mode:
                <select id="theme-mode" style="width: 100%; padding: 10px; margin-top: 6px; border-radius: 8px; border: 1px solid ${isBrowserDarkTheme ? "#444" : "#d0d0d0"}; background: ${isBrowserDarkTheme ? "#2a2a2a" : "#f8f8f8"}; color: ${isBrowserDarkTheme ? "#e8ecef" : "#1a1a1a"};">
                    <option value="grayscale" ${siteSettings.mode === "grayscale" ? "selected" : ""}>Grayscale</option>
                    <option value="sepia" ${siteSettings.mode === "sepia" ? "selected" : ""}>Sepia</option>
                    <option value="high-contrast" ${siteSettings.mode === "high-contrast" ? "selected" : ""}>High Contrast</option>
                </select>
            </label>
            <label style="display: block; margin-bottom: 14px;">
                Intensity: <span id="intensity-value">${siteSettings.grayscale}%</span>
                <input type="range" id="theme-intensity" min="0" max="100" value="${siteSettings.grayscale}" style="width: 100%; margin-top: 6px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
            </label>
            <label style="display: block; margin-bottom: 14px;" class="contrast-control">
                Contrast: <span id="contrast-value">${siteSettings.contrast}%</span>
                <input type="range" id="theme-contrast" min="50" max="200" value="${siteSettings.contrast}" style="width: 100%; margin-top: 6px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
            </label>
            <label style="display: block; margin-bottom: 14px;" class="contrast-control">
                Brightness: <span id="brightness-value">${siteSettings.brightness}%</span>
                <input type="range" id="theme-brightness" min="50" max="150" value="${siteSettings.brightness}" style="width: 100%; margin-top: 6px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
            </label>
            <label style="display: block; margin-bottom: 14px;">
                Saturation: <span id="saturation-value">${siteSettings.saturation}%</span>
                <input type="range" id="theme-saturation" min="0" max="200" value="${siteSettings.saturation}" style="width: 100%; margin-top: 6px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
            </label>
            <label style="display: flex; align-items: center; margin-bottom: 14px; cursor: pointer;">
                <input type="checkbox" id="text-contrast" ${siteSettings.textContrast ? "checked" : ""} style="margin-right: 10px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
                Enhance Text Contrast
            </label>
            <label style="display: block; margin-bottom: 14px;">
                Font Size: <span id="font-size-value">${siteSettings.fontSize}px</span>
                <input type="range" id="font-size" min="12" max="24" value="${siteSettings.fontSize}" style="width: 100%; margin-top: 6px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
            </label>
            <label style="display: flex; align-items: center; margin-bottom: 14px; cursor: pointer;">
                <input type="checkbox" id="animate-transitions" ${settings.animateTransitions ? "checked" : ""} style="margin-right: 10px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
                Smooth Transitions
            </label>
            <label style="display: flex; align-items: center; margin-bottom: 14px; cursor: pointer;">
                <input type="checkbox" id="auto-adjust" ${settings.autoAdjust ? "checked" : ""} style="margin-right: 10px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
                Auto-Adjust Intensity
            </label>
            <label style="display: flex; align-items: center; margin-bottom: 14px; cursor: pointer;">
                <input type="checkbox" id="color-inversion" ${siteSettings.colorInversion ? "checked" : ""} style="margin-right: 10px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
                Invert Colors
            </label>
            <label style="display: flex; align-items: center; margin-bottom: 14px; cursor: pointer;">
                <input type="checkbox" id="reduce-motion" ${settings.reduceMotion ? "checked" : ""} style="margin-right: 10px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
                Reduce Motion
            </label>
            <label style="display: flex; align-items: center; margin-bottom: 14px; cursor: pointer;">
                <input type="checkbox" id="high-performance" ${settings.highPerformance ? "checked" : ""} style="margin-right: 10px; accent-color: ${isBrowserDarkTheme ? "#a0a0ff" : "#4a4af0"};">
                High Performance Mode
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 16px;">
                <button id="export-settings" style="background: ${isBrowserDarkTheme ? "#3a3a3c" : "#e8ecef"}; color: ${isBrowserDarkTheme ? "#e8ecef" : "#1a1a1a"}; border: none; padding: 10px; border-radius: 8px; cursor: pointer; transition: background 0.2s, transform 0.1s;">
                    Export
                </button>
                <button id="import-settings" style="background: ${isBrowserDarkTheme ? "#3a3a3c" : "#e8ecef"}; color: ${isBrowserDarkTheme ? "#e8ecef" : "#1a1a1a"}; border: none; padding: 10px; border-radius: 8px; cursor: pointer; transition: background 0.2s, transform 0.1s;">
                    Import
                </button>
                <button id="reset-settings" style="background: ${isBrowserDarkTheme ? "#3a3a3c" : "#e8ecef"}; color: ${isBrowserDarkTheme ? "#e8ecef" : "#1a1a1a"}; border: none; padding: 10px; border-radius: 8px; cursor: pointer; transition: background 0.2s, transform 0.1s;">
                    Reset
                </button>
            </div>
            <button id="close-panel" style="width: 100%; margin-top: 16px; background: ${isBrowserDarkTheme ? "#4a4a4c" : "#d0d0d0"}; color: ${isBrowserDarkTheme ? "#e8ecef" : "#1a1a1a"}; border: none; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s, transform 0.1s;">
                Close
            </button>
        `;

        document.body.appendChild(panel);

        const elements = {
            enabledCheckbox: panel.querySelector("#theme-enabled"),
            modeSelect: panel.querySelector("#theme-mode"),
            intensitySlider: panel.querySelector("#theme-intensity"),
            contrastSlider: panel.querySelector("#theme-contrast"),
            brightnessSlider: panel.querySelector("#theme-brightness"),
            saturationSlider: panel.querySelector("#theme-saturation"),
            textContrastCheckbox: panel.querySelector("#text-contrast"),
            fontSizeSlider: panel.querySelector("#font-size"),
            animateTransitionsCheckbox: panel.querySelector("#animate-transitions"),
            autoAdjustCheckbox: panel.querySelector("#auto-adjust"),
            colorInversionCheckbox: panel.querySelector("#color-inversion"),
            reduceMotionCheckbox: panel.querySelector("#reduce-motion"),
            highPerformanceCheckbox: panel.querySelector("#high-performance"),
            intensityValue: panel.querySelector("#intensity-value"),
            contrastValue: panel.querySelector("#contrast-value"),
            brightnessValue: panel.querySelector("#brightness-value"),
            saturationValue: panel.querySelector("#saturation-value"),
            fontSizeValue: panel.querySelector("#font-size-value"),
            exportButton: panel.querySelector("#export-settings"),
            importButton: panel.querySelector("#import-settings"),
            resetButton: panel.querySelector("#reset-settings"),
            closeButton: panel.querySelector("#close-panel"),
        };

        elements.enabledCheckbox.addEventListener("change", () => {
            settings.enabled = elements.enabledCheckbox.checked;
            saveSettings();
            applyStyles();
        });

        elements.modeSelect.addEventListener("change", () => {
            const siteSettings = getSiteSettings();
            siteSettings.mode = elements.modeSelect.value;
            saveSiteSettings(siteSettings);
            panel.querySelectorAll(".contrast-control").forEach(el => {
                el.style.display = siteSettings.mode === "high-contrast" ? "block" : "none";
            });
            applyStyles();
        });

        elements.intensitySlider.addEventListener("input", () => {
            const siteSettings = getSiteSettings();
            siteSettings.grayscale = parseInt(elements.intensitySlider.value);
            elements.intensityValue.textContent = `${siteSettings.grayscale}%`;
            saveSiteSettings(siteSettings);
            applyStyles();
        });

        elements.contrastSlider.addEventListener("input", () => {
            const siteSettings = getSiteSettings();
            siteSettings.contrast = parseInt(elements.contrastSlider.value);
            elements.contrastValue.textContent = `${siteSettings.contrast}%`;
            saveSiteSettings(siteSettings);
            applyStyles();
        });

        elements.brightnessSlider.addEventListener("input", () => {
            const siteSettings = getSiteSettings();
            siteSettings.brightness = parseInt(elements.brightnessSlider.value);
            elements.brightnessValue.textContent = `${siteSettings.brightness}%`;
            saveSiteSettings(siteSettings);
            applyStyles();
        });

        elements.saturationSlider.addEventListener("input", () => {
            const siteSettings = getSiteSettings();
            siteSettings.saturation = parseInt(elements.saturationSlider.value);
            elements.saturationValue.textContent = `${siteSettings.saturation}%`;
            saveSiteSettings(siteSettings);
            applyStyles();
        });

        elements.textContrastCheckbox.addEventListener("change", () => {
            const siteSettings = getSiteSettings();
            siteSettings.textContrast = elements.textContrastCheckbox.checked;
            saveSiteSettings(siteSettings);
            applyStyles();
        });

        elements.fontSizeSlider.addEventListener("input", () => {
            const siteSettings = getSiteSettings();
            siteSettings.fontSize = parseInt(elements.fontSizeSlider.value);
            elements.fontSizeValue.textContent = `${siteSettings.fontSize}px`;
            saveSiteSettings(siteSettings);
            applyStyles();
        });

        elements.animateTransitionsCheckbox.addEventListener("change", () => {
            settings.animateTransitions = elements.animateTransitionsCheckbox.checked;
            saveSettings();
            applyStyles();
        });

        elements.autoAdjustCheckbox.addEventListener("change", () => {
            settings.autoAdjust = elements.autoAdjustCheckbox.checked;
            saveSettings();
            applyStyles();
        });

        elements.colorInversionCheckbox.addEventListener("change", () => {
            const siteSettings = getSiteSettings();
            siteSettings.colorInversion = elements.colorInversionCheckbox.checked;
            saveSiteSettings(siteSettings);
            applyStyles();
        });

        elements.reduceMotionCheckbox.addEventListener("change", () => {
            settings.reduceMotion = elements.reduceMotionCheckbox.checked;
            saveSettings();
            applyStyles();
        });

        elements.highPerformanceCheckbox.addEventListener("change", () => {
            settings.highPerformance = elements.highPerformanceCheckbox.checked;
            saveSettings();
            applyStyles();
        });

        elements.exportButton.addEventListener("click", () => {
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "black_white_theme_settings.json";
            a.click();
            URL.revokeObjectURL(url);
        });

        elements.importButton.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const imported = JSON.parse(event.target.result);
                            settings = { ...DEFAULT_SETTINGS, ...imported };
                            saveSettings();
                            applyStyles();
                            panel.remove();
                            panel = null;
                            createControlPanel();
                        } catch (err) {}
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        });

        elements.resetButton.addEventListener("click", () => {
            settings = { ...DEFAULT_SETTINGS };
            saveSettings();
            applyStyles();
            panel.remove();
            panel = null;
            createControlPanel();
        });

        elements.closeButton.addEventListener("click", () => {
            panel.style.transform = "translateY(30px)";
            panel.style.opacity = "0";
            setTimeout(() => {
                panel.style.display = "none";
                panel.style.transform = "translateY(0)";
                panel.style.opacity = "1";
            }, 300);
        });

        panel.querySelectorAll(".contrast-control").forEach(el => {
            el.style.display = siteSettings.mode === "high-contrast" ? "block" : "none";
        });

        panel.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("mousedown", () => btn.style.transform = "scale(0.95)");
            btn.addEventListener("mouseup", () => btn.style.transform = "scale(1)");
            btn.addEventListener("mouseleave", () => btn.style.transform = "scale(1)");
        });
    }

    function setupKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            if (e.altKey && e.key === "t") {
                settings.enabled = !settings.enabled;
                saveSettings();
                applyStyles();
            } else if (e.altKey && e.key === "p") {
                if (panel) {
                    panel.style.display = panel.style.display === "none" ? "block" : "none";
                } else {
                    createControlPanel();
                }
            } else if (e.altKey && e.key === "r") {
                settings = { ...DEFAULT_SETTINGS };
                saveSettings();
                applyStyles();
                if (panel) {
                    panel.remove();
                    panel = null;
                    createControlPanel();
                }
            }
        });
    }

    function observeDOM() {
        const observer = new MutationObserver(() => {
            if (settings.enabled && performance.now() - lastUpdate > 30) {
                requestAnimationFrame(applyStyles);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
        });
    }

    function init() {
        if (window.location.protocol === "file:") {
            return;
        }

        applyStyles();
        createControlPanel();
        setupKeyboardShortcuts();
        observeDOM();

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            isBrowserDarkTheme = e.matches;
            if (panel) {
                panel.remove();
                panel = null;
                createControlPanel();
            }
            applyStyles();
        });

        window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
            isReducedMotion = e.matches;
            applyStyles();
        });
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();
