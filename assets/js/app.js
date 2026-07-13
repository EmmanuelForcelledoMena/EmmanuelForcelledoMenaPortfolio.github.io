/* Portfolio interactions — vanilla JS, no dependencies */
(function () {
	"use strict";

	var doc = document.documentElement;
	var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------- Theme toggle ---------- */

	function currentTheme() {
		if (doc.dataset.theme) return doc.dataset.theme;
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}

	var toggle = document.querySelector(".theme-toggle");
	if (toggle) {
		toggle.addEventListener("click", function () {
			var next = currentTheme() === "dark" ? "light" : "dark";
			doc.dataset.theme = next;
			try { localStorage.setItem("theme", next); } catch (e) {}
		});
	}

	/* ---------- Header elevation ---------- */

	var header = document.querySelector(".site-header");
	function onScroll() {
		header.classList.toggle("scrolled", window.scrollY > 8);
	}
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	/* ---------- Scroll reveal ---------- */

	var reveals = document.querySelectorAll(".reveal");
	if (!reduced && "IntersectionObserver" in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("in");
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
		reveals.forEach(function (el) { io.observe(el); });
	} else {
		reveals.forEach(function (el) { el.classList.add("in"); });
	}

	/* ---------- Animated counters ---------- */

	var nums = document.querySelectorAll("[data-count]");

	function finalText(el) {
		return (el.dataset.prefix || "") + el.dataset.count + (el.dataset.suffix || "");
	}

	function runCounter(el) {
		var target = parseFloat(el.dataset.count);
		var prefix = el.dataset.prefix || "";
		var suffix = el.dataset.suffix || "";
		var dur = 1300;
		var start = performance.now();
		function frame(now) {
			var p = Math.min((now - start) / dur, 1);
			var eased = 1 - Math.pow(1 - p, 3);
			el.textContent = prefix + Math.round(target * eased) + suffix;
			if (p < 1) requestAnimationFrame(frame);
			else el.textContent = finalText(el);
		}
		requestAnimationFrame(frame);
	}

	if (reduced || !("IntersectionObserver" in window)) {
		nums.forEach(function (el) { el.textContent = finalText(el); });
	} else {
		var cio = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					runCounter(entry.target);
					cio.unobserve(entry.target);
				}
			});
		}, { threshold: 0.5 });
		nums.forEach(function (el) { cio.observe(el); });
	}

	/* ---------- Scrollspy (same-page anchors) ---------- */

	var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[data-spy]"));
	if (spyLinks.length && "IntersectionObserver" in window) {
		var map = new Map();
		spyLinks.forEach(function (a) {
			var hash = a.getAttribute("href").split("#")[1];
			var sec = hash && document.getElementById(hash);
			if (sec) map.set(sec, a);
		});
		var sio = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					spyLinks.forEach(function (l) { l.classList.remove("active"); });
					map.get(entry.target).classList.add("active");
				}
			});
		}, { rootMargin: "-35% 0px -60% 0px" });
		map.forEach(function (_a, sec) { sio.observe(sec); });
	}

	/* ---------- Footer year ---------- */

	var y = document.getElementById("year");
	if (y) y.textContent = new Date().getFullYear();
})();
