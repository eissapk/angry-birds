//! Cache the assets
const staticMyNote = "angry-birds-game-v1";
const assets = [
    "index.html",
    "style/app.min.css",
    "script/app.min.js",
    "script/html5shiv.js",
    "media/gold.mp3",
    "media/skip-king.mp3",
    "media/game-over.mp3",
    "img/title.svg",
    "img/logo.webp",
    "img/world/bg.png",
    "img/world/ground.png",
    "img/world/characters/bird.png",
    "img/world/characters/egg.png",
    "img/world/characters/king-1.png",
    "img/world/characters/king-2.png",
    "img/world/characters/pig-1.png",
    "img/world/characters/pig-2.png",
    "img/world/characters/pig-3.png",
    "img/world/characters/pig-4.png"
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticMyNote).then(cache => {
            cache.addAll(assets);
        })
    );
});

//* Fetch the assets
self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request);
        })
    );
});