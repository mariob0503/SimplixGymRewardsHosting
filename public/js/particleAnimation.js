// Background Particle Animation Module
var ParticleAnimation = (function() {
    var canvas, ctx, particles = [], numParticles = 300;
    var animationFrameId = null;  // Add this to track the animation frame
    
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        ctx = canvas.getContext("2d");
        resize();
        createParticles();
        animate();
        
        window.addEventListener("resize", resize);
    }
    
    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.alpha = Math.random() * 0.7 + 0.3;
        this.pulse = Math.random() * 0.1;
        this.pulseSpeed = 0.05 + Math.random() * 0.05;
    }
    
    function createParticles() {
        particles = [];
        for (var i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            p.pulse += p.pulseSpeed;
            if (p.pulse > 1) {
                p.pulse = 0;
                p.pulseSpeed = 0.05 + Math.random() * 0.05;
            }
            
            var currentAlpha = p.alpha * (0.7 + Math.sin(p.pulse * Math.PI) * 0.3);
            var currentRadius = p.radius * (0.8 + Math.sin(p.pulse * Math.PI) * 0.2);
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2, false);
            ctx.fillStyle = "rgba(173,216,230," + currentAlpha + ")";
            ctx.fill();
        }
        animationFrameId = requestAnimationFrame(animate);
    }
    
    return {
        start: function(canvasId) {
            // Stop any existing animation before starting new one
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            init(canvasId);
        },
        stop: function() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            if (canvas) {
                window.removeEventListener("resize", resize);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas = null;
                ctx = null;
                particles = [];
            }
        }
    };
})(); 