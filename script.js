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
    constructor(x, y, radius, color, type) {
        this.x = x;
        this.y = y;
        this.baseRadius = radius; // Store the target radius
        this.radius = 0; // Start at 0 for animation
        this.color = color;
        this.type = type;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
        };
        this.spawnTime = Date.now(); // Timestamp for animation
        this.animationDuration = 1000; // 1 second in milliseconds
        this.isAnimating = true;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `${this.color}80`); // 50% opacity center
        gradient.addColorStop(1, `${this.color}FF`); // 100% opacity edge
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        // Handle spawn animation
        if (this.isAnimating) {
            const elapsed = Date.now() - this.spawnTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);

            if (progress < 0.5) {
                // Grow from 0% to 110% in first half
                this.radius = this.baseRadius * (progress * 2 * 1.1);
            } else {
                // Shrink from 110% to 100% in second half
                this.radius = this.baseRadius * (1.1 - (progress - 0.5) * 0.2);
            }

            if (progress >= 1) {
                this.radius = this.baseRadius; // Ensure it ends at 100%
                this.isAnimating = false; // Stop animation
            }
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

function initializeBubbles() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const totalArea = canvas.width * canvas.height;
    const maxBubbles = bubbleTypes.hours.maxCount + 
                      bubbleTypes.minutes.maxCount + 
                      bubbleTypes.seconds.maxCount;
    const scaleFactor = Math.sqrt(totalArea / (maxBubbles * 1000));

    // Initial hour bubbles (no animation for initial set)
    for (let i = 0; i < hours; i++) {
        const bubble = new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.hours.baseRadius * scaleFactor,
            bubbleTypes.hours.color,
            'hours'
        );
        bubble.radius = bubble.baseRadius; // Set directly to full size
        bubble.isAnimating = false; // Skip animation
        bubbles.push(bubble);
    }

    // Initial minute bubbles (no animation for initial set)
    for (let i = 0; i < minutes; i++) {
        const bubble = new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.minutes.baseRadius * scaleFactor,
            bubbleTypes.minutes.color,
            'minutes'
        );
        bubble.radius = bubble.baseRadius;
        bubble.isAnimating = false;
        bubbles.push(bubble);
    }

    // Initial second bubbles (no animation for initial set)
    for (let i = 0; i < seconds
