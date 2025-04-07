// script.js
const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Bubble class with spawn and shrink animations
class Bubble {
    constructor(x, y, baseRadius, color, type) {
        this.x = x;
        this.y = y;
        this.baseRadius = baseRadius;
        this.radius = 0; // Start at 0 for spawn animation
        this.color = color;
        this.type = type;
        this.velocity = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 };
        this.spawnTime = Date.now();
        this.animationDuration = 1000; // 1 second for animations
        this.isSpawning = true;
        this.isShrinking = false;
        this.shrinkStartTime = null;
    }

    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `${this.color}80`);
        gradient.addColorStop(1, `${this.color}FF`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        const now = Date.now();

        // Spawn animation: 0% → 110% → 100% over 1 second
        if (this.isSpawning) {
            const elapsed = now - this.spawnTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            if (progress < 0.5) {
                this.radius = this.baseRadius * (progress * 2 * 1.1); // Grow to 110%
            } else {
                this.radius = this.baseRadius * (1.1 - (progress - 0.5) * 0.2); // Settle to 100%
            }
            if (progress >= 1) {
                this.radius = this.baseRadius;
                this.isSpawning = false;
            }
        }

        // Shrink animation: 100% → 0% over 1 second
        if (this.isShrinking) {
            const elapsed = now - this.shrinkStartTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            this.radius = this.baseRadius * (1 - progress);
            if (progress >= 1) {
                this.radius = 0;
                this.remove = true; // Mark for removal after shrinking
            }
        }

        // Movement and bounce off walls
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.velocity.x = -this.velocity.x;
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.velocity.y = -this.velocity.y;
    }
}

// Bubble configurations
const bubbleTypes = {
    hours: { color: '#8B5CF6', baseRadius: 40, maxCount: 12 },
    minutes: { color: '#3B82F6', baseRadius: 25, maxCount: 59 },
    seconds: { color: '#EC4899', baseRadius: 15, maxCount: 59 }
};

let bubbles = [];
let lastTime = null;

function initializeBubbles() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const totalArea = canvas.width * canvas.height;
    const maxBubbles = bubbleTypes.hours.maxCount + bubbleTypes.minutes.maxCount + bubbleTypes.seconds.maxCount;
    const scaleFactor = Math.sqrt(totalArea / (maxBubbles * 1000));

    // Initial bubbles start at full size (no spawn animation)
    for (let i = 0; i < hours; i++) {
        const bubble = new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.hours.baseRadius * scaleFactor,
            bubbleTypes.hours.color,
            'hours'
        );
        bubble.radius = bubble.baseRadius;
        bubble.isSpawning = false;
        bubbles.push(bubble);
    }
    for (let i = 0; i < minutes; i++) {
        const bubble = new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.minutes.baseRadius * scaleFactor,
            bubbleTypes.minutes.color,
            'minutes'
        );
        bubble.radius = bubble.baseRadius;
        bubble.isSpawning = false;
        bubbles.push(bubble);
    }
    for (let i = 0; i < seconds; i++) {
        const bubble = new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.seconds.baseRadius * scaleFactor,
            bubbleTypes.seconds.color,
            'seconds'
        );
        bubble.radius = bubble.baseRadius;
        bubble.isSpawning = false;
        bubbles.push(bubble);
    }

    lastTime = now;
}

function updateBubbles() {
    const now = new Date();
    if (!lastTime) return;

    const totalArea = canvas.width * canvas.height;
    const maxBubbles = bubbleTypes.hours.maxCount + bubbleTypes.minutes.maxCount + bubbleTypes.seconds.maxCount;
    const scaleFactor = Math.sqrt(totalArea / (maxBubbles * 1000));

    const timeDiff = (now - lastTime) / 1000;
    if (timeDiff >= 1) {
        const secondsToAdd = Math.floor(timeDiff);

        for (let i = 0; i < secondsToAdd; i++) {
            const activeSeconds = bubbles.filter(b => b.type === 'seconds' && !b.isShrinking).length;
            if (activeSeconds < bubbleTypes.seconds.maxCount) {
                // Add a new seconds bubble
                bubbles.push(new Bubble(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    bubbleTypes.seconds.baseRadius * scaleFactor,
                    bubbleTypes.seconds.color,
                    'seconds'
                ));
            } else {
                // Start shrinking seconds bubbles
                bubbles.forEach(b => {
                    if (b.type === 'seconds' && !b.isShrinking && !b.isSpawning) {
                        b.isShrinking = true;
                        b.shrinkStartTime = Date.now();
                    }
                });

                const activeMinutes = bubbles.filter(b => b.type === 'minutes' && !b.isShrinking).length;
                if (activeMinutes < bubbleTypes.minutes.maxCount) {
                    // Add a new minutes bubble
                    bubbles.push(new Bubble(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        bubbleTypes.minutes.baseRadius * scaleFactor,
                        bubbleTypes.minutes.color,
                        'minutes'
                    ));
                } else {
                    // Start shrinking minutes bubbles
                    bubbles.forEach(b => {
                        if (b.type === 'minutes' && !b.isShrinking && !b.isSpawning) {
                            b.isShrinking = true;
                            b.shrinkStartTime = Date.now();
                        }
                    });

                    const activeHours = bubbles.filter(b => b.type === 'hours' && !b.isShrinking).length;
                    if (activeHours < bubbleTypes.hours.maxCount) {
                        // Add a new hours bubble
                        bubbles.push(new Bubble(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height,
                            bubbleTypes.hours.baseRadius * scaleFactor,
                            bubbleTypes.hours.color,
                            'hours'
                        ));
                    } else {
                        // Start shrinking hours bubbles
                        bubbles.forEach(b => {
                            if (b.type === 'hours' && !b.isShrinking && !b.isSpawning) {
                                b.isShrinking = true;
                                b.shrinkStartTime = Date.now();
                            }
                        });
                    }
                }
            }
        }
        lastTime = new Date(now.getTime() - (now.getTime() % 1000));
    }

    // Remove bubbles that have finished shrinking
    bubbles = bubbles.filter(b => !b.remove);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBubbles();
    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
    });

    requestAnimationFrame(animate);
}

// Initial setup
initializeBubbles();
animate();

// Prevent double tap zoom on touch devices
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    e.preventDefault();
}, { passive: false });
