document.addEventListener("DOMContentLoaded", function () {
    const textContainer = document.getElementById("text-container");
    const pinkboardCanvas = document.getElementById("pinkboard");
    const starCanvas = document.getElementById("stars");

    const messages = [
        "Uii ai mà xinh thế này :3",
        "Sao trông cậu buồn vậy ?",
        "Trông đáng yêu thế mà lại buồn",
        "Thôi không sao, có gì muốn nói cứ nói ra đi, tớ sẽ lắng nghe mà !",
        "Nào vui lên nhaa ❤️"
    ];

    /* ==========================================
       1. HIỆU ỨNG ĐÁNH CHỮ
    ========================================== */
    let msgIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimeout;

    function typeWriter() {
        if (!textContainer) return;

        const currentMsg = messages[msgIndex];

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        textContainer.innerHTML =
            currentMsg.substring(0, charIndex) + "<span class='cursor'></span>";

        let typeSpeed = isDeleting ? 70 : 120;

        if (!isDeleting && charIndex === currentMsg.length) {
            typeSpeed = 1800;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            msgIndex = (msgIndex + 1) % messages.length;
            typeSpeed = 400;
        }

        typingTimeout = setTimeout(typeWriter, typeSpeed);
    }

    setTimeout(typeWriter, 700);

    /* ==========================================
       2. HIỆU ỨNG TRÁI TIM HẠT
    ========================================== */
    const settings = {
        particles: {
            length: 1800,
            duration: 2.5,
            velocity: 100,
            effect: -1.2,
            size: 18
        }
    };

    (function () {
        let lastTime = 0;
        const vendors = ["ms", "moz", "webkit", "o"];
        for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
            window.cancelAnimationFrame =
                window[vendors[x] + "CancelAnimationFrame"] ||
                window[vendors[x] + "CancelRequestAnimationFrame"];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback) {
                const currTime = new Date().getTime();
                const timeToCall = Math.max(0, 16 - (currTime - lastTime));
                const id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    })();

    function Point(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    };

    Point.prototype.length = function (length) {
        if (typeof length === "undefined") {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
    };

    Point.prototype.normalize = function () {
        const length = this.length();
        if (length === 0) return this;
        this.x /= length;
        this.y /= length;
        return this;
    };

    function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }

    Particle.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
    };

    Particle.prototype.update = function (deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
    };

    Particle.prototype.draw = function (context, image) {
        function ease(t) {
            return (--t) * t * t + 1;
        }

        const size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(
            image,
            this.position.x - size / 2,
            this.position.y - size / 2,
            size,
            size
        );
    };

    function ParticlePool(length) {
        this.particles = new Array(length);
        this.firstActive = 0;
        this.firstFree = 0;
        this.duration = settings.particles.duration;

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i] = new Particle();
        }
    }

    ParticlePool.prototype.add = function (x, y, dx, dy) {
        this.particles[this.firstFree].initialize(x, y, dx, dy);

        this.firstFree++;
        if (this.firstFree === this.particles.length) this.firstFree = 0;

        if (this.firstActive === this.firstFree) {
            this.firstActive++;
            if (this.firstActive === this.particles.length) this.firstActive = 0;
        }
    };

    ParticlePool.prototype.update = function (deltaTime) {
        let i;

        if (this.firstActive < this.firstFree) {
            for (i = this.firstActive; i < this.firstFree; i++) {
                this.particles[i].update(deltaTime);
            }
        } else if (this.firstFree < this.firstActive) {
            for (i = this.firstActive; i < this.particles.length; i++) {
                this.particles[i].update(deltaTime);
            }
            for (i = 0; i < this.firstFree; i++) {
                this.particles[i].update(deltaTime);
            }
        }

        while (
            this.particles[this.firstActive].age >= this.duration &&
            this.firstActive !== this.firstFree
        ) {
            this.firstActive++;
            if (this.firstActive === this.particles.length) this.firstActive = 0;
        }
    };

    ParticlePool.prototype.draw = function (context, image) {
        let i;

        if (this.firstActive < this.firstFree) {
            for (i = this.firstActive; i < this.firstFree; i++) {
                this.particles[i].draw(context, image);
            }
        } else if (this.firstFree < this.firstActive) {
            for (i = this.firstActive; i < this.particles.length; i++) {
                this.particles[i].draw(context, image);
            }
            for (i = 0; i < this.firstFree; i++) {
                this.particles[i].draw(context, image);
            }
        }

        context.globalAlpha = 1;
    };

    if (pinkboardCanvas) {
        const context = pinkboardCanvas.getContext("2d");
        const particles = new ParticlePool(settings.particles.length);
        const particleRate = settings.particles.length / settings.particles.duration;
        let time;

        function pointOnHeart(t) {
            return new Point(
                160 * Math.pow(Math.sin(t), 3),
                130 * Math.cos(t) -
                50 * Math.cos(2 * t) -
                20 * Math.cos(3 * t) -
                10 * Math.cos(4 * t) +
                25
            );
        }

        const image = (function () {
            const tempCanvas = document.createElement("canvas");
            const tempContext = tempCanvas.getContext("2d");

            tempCanvas.width = settings.particles.size;
            tempCanvas.height = settings.particles.size;

            function to(t) {
                const point = pointOnHeart(t);
                point.x =
                    settings.particles.size / 2 +
                    (point.x * settings.particles.size) / 350;
                point.y =
                    settings.particles.size / 2 -
                    (point.y * settings.particles.size) / 350;
                return point;
            }

            tempContext.beginPath();
            let t = -Math.PI;
            let point = to(t);
            tempContext.moveTo(point.x, point.y);

            while (t < Math.PI) {
                t += 0.01;
                point = to(t);
                tempContext.lineTo(point.x, point.y);
            }

            tempContext.closePath();

            const gradient = tempContext.createLinearGradient(
                0,
                0,
                settings.particles.size,
                settings.particles.size
            );
            gradient.addColorStop(0, "#ff0055");
            gradient.addColorStop(1, "#ff758c");
            tempContext.fillStyle = gradient;
            tempContext.fill();

            const img = new Image();
            img.src = tempCanvas.toDataURL();
            return img;
        })();

        function resizePinkboard() {
            const rect = pinkboardCanvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            pinkboardCanvas.width = rect.width * dpr;
            pinkboardCanvas.height = rect.height * dpr;

            context.setTransform(1, 0, 0, 1, 0, 0);
            context.scale(dpr, dpr);
        }

        function render() {
            requestAnimationFrame(render);

            const newTime = new Date().getTime() / 1000;
            const deltaTime = newTime - (time || newTime);
            time = newTime;

            const w = pinkboardCanvas.clientWidth;
            const h = pinkboardCanvas.clientHeight;

            context.clearRect(0, 0, w, h);

            const amount = particleRate * deltaTime;
            for (let i = 0; i < amount; i++) {
                const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
                const dir = pos.clone().length(settings.particles.velocity);
                particles.add(w / 2 + pos.x, h / 2 - pos.y, dir.x, -dir.y);
            }

            particles.update(deltaTime);
            particles.draw(context, image);
        }

        resizePinkboard();
        render();

        window.addEventListener("resize", resizePinkboard);
        window.addEventListener("orientationchange", resizePinkboard);
    }

    /* ==========================================
       3. HIỆU ỨNG SAO RƠI
    ========================================== */
    if (starCanvas) {
        const ctxStar = starCanvas.getContext("2d");
        let stars = [];

        function getStarCount() {
            const w = window.innerWidth;
            if (w <= 480) return 80;
            if (w <= 768) return 110;
            return 150;
        }

        function buildStars() {
            const count = getStarCount();
            stars = [];

            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * starCanvas.width,
                    y: Math.random() * starCanvas.height,
                    radius: Math.random() * 1.5 + 0.2,
                    speed: Math.random() * 0.5 + 0.1,
                    color: Math.random() > 0.8 ? "#ffb3c6" : "#ffffff"
                });
            }
        }

        function resizeStars() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;

            starCanvas.width = w * dpr;
            starCanvas.height = h * dpr;
            starCanvas.style.width = w + "px";
            starCanvas.style.height = h + "px";

            ctxStar.setTransform(1, 0, 0, 1, 0, 0);
            ctxStar.scale(dpr, dpr);

            buildStars();
        }

        function drawStars() {
            ctxStar.clearRect(0, 0, window.innerWidth, window.innerHeight);

            for (const star of stars) {
                ctxStar.fillStyle = star.color;
                ctxStar.beginPath();
                ctxStar.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctxStar.fill();

                star.y += star.speed;

                if (star.y > window.innerHeight) {
                    star.y = -5;
                    star.x = Math.random() * window.innerWidth;
                }
            }

            requestAnimationFrame(drawStars);
        }

        resizeStars();
        drawStars();

        window.addEventListener("resize", resizeStars);
        window.addEventListener("orientationchange", resizeStars);
    }
});
