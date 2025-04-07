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
        this.radius = radius;
        this.color = color;
        this.type = type;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
        };
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

    // Initial hour bubbles
    for (let i = 0; i < hours; i++) {
        bubbles.push(new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.hours.baseRadius * scaleFactor,
            bubbleTypes.hours.color,
            'hours'
        ));
    }

    // Initial minute bubbles
    for (let i = 0; i < minutes; i++) {
        bubbles.push(new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.minutes.baseRadius * scaleFactor,
            bubbleTypes.minutes.color,
            'minutes'
        ));
    }

    // Initial second bubbles
    for (let i = 0; i < seconds; i++) {
        bubbles.push(new Bubble(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            bubbleTypes.seconds.baseRadius * scaleFactor,
            bubbleTypes.seconds.color,
            'seconds'
        ));
    }

    lastTime = now;
}

function updateBubbles() {
    const now = new Date();
    if (!lastTime) return;

    const totalArea = canvas.width * canvas.height;
    const maxBubbles = bubbleTypes.hours.maxCount + 
                      bubbleTypes.minutes.maxCount + 
                      bubbleTypes.seconds.maxCount;
    const scaleFactor = Math.sqrt(totalArea / (maxBubbles * 1000));

    const timeDiff = (now - lastTime) / 1000; // Difference in seconds
    if (timeDiff >= 1) {
        const secondsToAdd = Math.floor(timeDiff);
        
        // Add seconds bubbles
        for (let i = 0; i < secondsToAdd; i++) {
            if (bubbles.filter(b => b.type === 'seconds').length < bubbleTypes.seconds.maxCount) {
                bubbles.push(new Bubble(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    bubbleTypes.seconds.baseRadius * scaleFactor,
                    bubbleTypes.seconds.color,
                    'seconds'
                ));
            } else {
                // Reset seconds and add minute
                bubbles = bubbles.filter(b => b.type !== 'seconds');
                if (bubbles.filter(b => b.type === 'minutes').length < bubbleTypes.minutes.maxCount) {
                    bubbles.push(new Bubble(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        bubbleTypes.minutes.baseRadius * scaleFactor,
                        bubbleTypes.minutes.color,
                        'minutes'
                    ));
                } else {
                    // Reset minutes and add hour
                    bubbles = bubbles.filter(b => b.type !== 'minutes');
                    if (bubbles.filter(b => b.type === 'hours').length < bubbleTypes.hours.maxCount) {
                        bubbles.push(new Bubble(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height,
                            bubbleTypes.hours.baseRadius * scaleFactor,
                            bubbleTypes.hours.color,
                            'hours'
                        ));
                    } else {
                        // Reset hours (midnight/noon)
                        bubbles = bubbles.filter(b => b.type !== 'hours');
                    }
                }
            }
        }
        lastTime = new Date(now.getTime() - (now.getTime() % 1000));
    }
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

// Prevent double tap zoom
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    e.preventDefault();
}, { passive: false });
