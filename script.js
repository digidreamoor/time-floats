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

// Bubble class
class Bubble {
    constructor(x, y, baseRadius, color, type) {
        this.x = x;
        this.y = y;
        this.baseRadius = baseRadius; // Target radius before animation
        this.currentBaseRadius = baseRadius; // Current radius for scaling
        this.radius = 0; // Start at 0 for animation
        this.color = color;
        this.type = type;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
        };
        this.spawnTime = Date.now();
        this.animationDuration = 1000; // 1 second
        this.isAnimating = true;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `${this.color}80`);
        gradient.addColorStop(1, `${this.color}FF`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
    }

    update(otherBubbles) {
        // Spawn animation: 0% → 110% → 100% over 1 second
        if (this.isAnimating) {
            const elapsed = Date.now() - this.spawnTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            if (progress < 0.5) {
                this.radius = this.currentBaseRadius * (progress * 2 * 1.1);
            } else {
                this.radius = this.currentBaseRadius * (1.1 - (progress - 0.5) * 0.2);
            }
            if (progress >= 1) {
                this.radius = this.currentBaseRadius;
                this.isAnimating = false;
            }
        } else {
            this.radius = this.currentBaseRadius;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Bounce off walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.velocity.y = -this.velocity.y;
        }

        // Prevent overlap with other bubbles
        otherBubbles.forEach(other => {
            if (other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = this.radius + other.radius;
                if (distance < minDistance && distance > 0) {
                    // Push bubbles apart
                    const overlap = (minDistance - distance) / 2;
                    const angle = Math.atan2(dy, dx);
                    this.x -= overlap * Math.cos(angle);
                    this.y -= overlap * Math.sin(angle);
                    other.x += overlap * Math.cos(angle);
                    other.y += overlap * Math.sin(angle);
                    // Adjust velocities to prevent sticking
                    this.velocity.x -= 0.05 * Math.cos(angle);
                    this.velocity.y -= 0.05 * Math.sin(angle);
                    other.velocity.x += 0.05 * Math.cos(angle);
                    other.velocity.y += 0.05 * Math.sin(angle);
                }
            }
        });

        // Gentle force toward edges to encourage spread
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 0.1 / distanceFromCenter; // Weaker as distance increases
        this.velocity.x += force * (dx / distanceFromCenter);
        this.velocity.y += force * (dy / distanceFromCenter);
    }
}

// Bubble configurations
const bubbleTypes = {
    hours: {
        color: '#8B5CF6',    // Soft Rich Purple
        baseRadius: 40,
        maxCount: 12
    },
    minutes: {
        color: '#3B82F6',    // Soft Rich Blue
        baseRadius: 25,
        maxCount: 59
    },
    seconds: {
        color: '#EC4899',    // Soft Rich Pink
        baseRadius: 15,
        maxCount: 59
    }
};

let bubbles = [];
let lastTime = null;
let lastMinute = null;

function calculateScaleFactor(totalBubbles) {
    const totalArea = canvas.width * canvas.height;
    // Inverse scaling: fewer bubbles = larger, more bubbles = smaller
    // Base area assumes max bubbles (130) at a reference scale
    const referenceBubbles = 130; // Max possible (12 + 59 + 59)
    const baseScale = Math.sqrt(totalArea / (referenceBubbles * 1000));
    // Adjust scale inversely with bubble count
    return baseScale * Math.sqrt(referenceBubbles / Math.max(totalBubbles, 1));
}

function updateBubbleSizes() {
    const totalBubbles = bubbles.length;
    const scaleFactor = calculateScaleFactor(totalBubbles);
    bubbles.forEach(bubble => {
        bubble.currentBaseRadius = bubbleTypes[bubble.type].baseRadius * scaleFactor;
        if (!bubble.isAnimating) {
            bubble.radius = bubble.currentBaseRadius;
        }
    });
}

function initializeBubbles() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    lastMinute = minutes;

    const totalBubbles = hours + minutes + seconds;
    const scaleFactor = calculateScaleFactor(totalBubbles);

    // Initial bubbles start at full size
    for (let i = 0; i < hours; i++) {
        const bubble = new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.hours.baseRadius * scaleFactor,
            bubbleTypes.hours.color,
            'hours'
        );
        bubble.currentBaseRadius = bubbleTypes.hours.baseRadius * scaleFactor;
        bubble.radius = bubble.currentBaseRadius;
        bubble.isAnimating = false;
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
        bubble.currentBaseRadius = bubbleTypes.minutes.baseRadius * scaleFactor;
        bubble.radius = bubble.currentBaseRadius;
        bubble.isAnimating = false;
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
        bubble.currentBaseRadius = bubbleTypes.seconds.baseRadius * scaleFactor;
        bubble.radius = bubble.currentBaseRadius;
        bubble.isAnimating = false;
        bubbles.push(bubble);
    }

    lastTime = now;
}

function updateBubbles() {
    const now = new Date();
    if (!lastTime) return;

    const minutes = now.getMinutes();
    const totalBubbles = bubbles.length;
    const scaleFactor = calculateScaleFactor(totalBubbles);

    // Update sizes every minute
    if (minutes !== lastMinute) {
        updateBubbleSizes();
        lastMinute = minutes;
    }

    const timeDiff = (now - lastTime) / 1000;
    if (timeDiff >= 1) {
        const secondsToAdd = Math.floor(timeDiff);
        
        for (let i = 0; i < secondsToAdd; i++) {
            if (bubbles.filter(b => b.type === 'seconds').length < bubbleTypes.seconds.maxCount) {
                const bubble = new Bubble(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    bubbleTypes.seconds.baseRadius * scaleFactor,
                    bubbleTypes.seconds.color,
                    'seconds'
                );
                bubble.currentBaseRadius = bubbleTypes.seconds.baseRadius * scaleFactor;
                bubbles.push(bubble);
            } else {
                bubbles = bubbles.filter(b => b.type !== 'seconds');
                if (bubbles.filter(b => b.type === 'minutes').length < bubbleTypes.minutes.maxCount) {
                    const bubble = new Bubble(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        bubbleTypes.minutes.baseRadius * scaleFactor,
                        bubbleTypes.minutes.color,
                        'minutes'
                    );
                    bubble.currentBaseRadius = bubbleTypes.minutes.baseRadius * scaleFactor;
                    bubbles.push(bubble);
                } else {
                    bubbles = bubbles.filter(b => b.type !== 'minutes');
                    if (bubbles.filter(b => b.type === 'hours').length < bubbleTypes.hours.maxCount) {
                        const bubble = new Bubble(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height,
                            bubbleTypes.hours.baseRadius * scaleFactor,
                            bubbleTypes.hours.color,
                            'hours'
                        );
                        bubble.currentBaseRadius = bubbleTypes.hours.baseRadius * scaleFactor;
                        bubbles.push(bubble);
                    } else {
                        bubbles = bubbles.filter(b => b.type !== 'hours');
                    }
                }
                updateBubbleSizes();
            }
        }
        lastTime = new Date(now.getTime() - (now.getTime() % 1000));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateBubbles();
    bubbles.forEach(bubble => {
        bubble.update(bubbles); // Pass all bubbles for collision detection
        bubble.draw();
    });

    requestAnimationFrame(animate);
}

// Initial setup
initializeBubbles();
animate();

// Prevent double tap zoom
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    e.preventDefault();
}, { passive: false });
