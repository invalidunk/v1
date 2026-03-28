document.addEventListener("DOMContentLoaded", function() {
    const textContainer = document.getElementById("text-container");
    const messages = [
        "Uii ai mà xinh thế này 😍", 
        "Sao trông cậu buồn vậy ?", 
        "Trông đáng yêu thế mà lại buồn 😗", 
        "Thôi không sao •.• có gì muốn tâm sự thì kể tớ này !",
        "1..2..3 Cười 😝"
    ]; 
    
    let msgIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        if (!textContainer) return;
        const currentMsg = messages[msgIndex];
        
        if (isDeleting) charIndex--;
        else charIndex++;

        textContainer.innerHTML = currentMsg.substring(0, charIndex) + "<span class='cursor'></span>";

        let typeSpeed = isDeleting ? 80 : 150;

        if (!isDeleting && charIndex === currentMsg.length) {
            typeSpeed = 2000; 
            isDeleting = true;
        } 
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            msgIndex = (msgIndex + 1) % messages.length; 
            typeSpeed = 500; 
        }
        setTimeout(typeWriter, typeSpeed);
    }
    
    setTimeout(typeWriter, 1000);

    /* ==========================================
       2. HIỆU ỨNG TRÁI TIM HẠT
    ========================================== */
    var settings = {
        particles: {
            length:   2500, 
            duration:   2.5, 
            velocity: 100, 
            effect: -1.2, 
            size:      18, 
        },
    };

    (function(){var b=0;var c=["ms","moz","webkit","o"];for(var a=0;a<c.length&&!window.requestAnimationFrame;++a){window.requestAnimationFrame=window[c[a]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[c[a]+"CancelAnimationFrame"]||window[c[a]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame){window.requestAnimationFrame=function(h,e){var d=new Date().getTime();var f=Math.max(0,16-(d-b));var g=window.setTimeout(function(){h(d+f)},f);b=d+f;return g}}if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(d){clearTimeout(d)}}}());

    var Point = (function() {
        function Point(x, y) { this.x = x || 0; this.y = y || 0; }
        Point.prototype.clone = function() { return new Point(this.x, this.y); };
        Point.prototype.length = function(length) {
            if (typeof length == 'undefined') return Math.sqrt(this.x * this.x + this.y * this.y);
            this.normalize(); this.x *= length; this.y *= length; return this;
        };
        Point.prototype.normalize = function() {
            var length = this.length(); this.x /= length; this.y /= length; return this;
        };
        return Point;
    })();

    var Particle = (function() {
        function Particle() {
            this.position = new Point();
            this.velocity = new Point();
            this.acceleration = new Point();
            this.age = 0;
        }
        Particle.prototype.initialize = function(x, y, dx, dy) {
            this.position.x = x; this.position.y = y;
            this.velocity.x = dx; this.velocity.y = dy;
            this.acceleration.x = dx * settings.particles.effect;
            this.acceleration.y = dy * settings.particles.effect;
            this.age = 0;
        };
        Particle.prototype.update = function(deltaTime) {
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.velocity.x += this.acceleration.x * deltaTime;
            this.velocity.y += this.acceleration.y * deltaTime;
            this.age += deltaTime;
        };
        Particle.prototype.draw = function(context, image) {
            function ease(t) { return (--t) * t * t + 1; }
            var size = image.width * ease(this.age / settings.particles.duration);
            context.globalAlpha = 1 - this.age / settings.particles.duration;
            context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
        };
        return Particle;
    })();

    var ParticlePool = (function() {
        var particles, firstActive = 0, firstFree = 0, duration = settings.particles.duration;
        function ParticlePool(length) {
            particles = new Array(length);
            for (var i = 0; i < particles.length; i++) particles[i] = new Particle();
        }
        ParticlePool.prototype.add = function(x, y, dx, dy) {
            particles[firstFree].initialize(x, y, dx, dy);
            firstFree++;
            if (firstFree == particles.length) firstFree = 0;
            if (firstActive == firstFree) firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        };
        ParticlePool.prototype.update = function(deltaTime) {
            var i;
            if (firstActive < firstFree) { 
                for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime); 
            } else if (firstFree < firstActive) {
                for (i = firstActive; i < particles.length; i++) particles[i].update(deltaTime);
                for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
            }
            while (particles[firstActive].age >= duration && firstActive != firstFree) {
                firstActive++;
                if (firstActive == particles.length) firstActive = 0;
            }
        };
        ParticlePool.prototype.draw = function(context, image) {
            if (firstActive < firstFree) { 
                for (let i = firstActive; i < firstFree; i++) particles[i].draw(context, image); 
            } else if (firstFree < firstActive) {
                for (let i = firstActive; i < particles.length; i++) particles[i].draw(context, image);
                for (let i = 0; i < firstFree; i++) particles[i].draw(context, image);
            }
        };
        return ParticlePool;
    })();

    var pinkboardCanvas = document.getElementById('pinkboard');
    if (pinkboardCanvas) {
        (function(canvas) {
            var context = canvas.getContext('2d'),
                particles = new ParticlePool(settings.particles.length),
                particleRate = settings.particles.length / settings.particles.duration, 
                time;

            // Tách riêng logic lấy tọa độ gốc của toán học để xử lý scale
            function basePointOnHeart(t) {
                return new Point(
                    160 * Math.pow(Math.sin(t), 3),
                    130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
                );
            }

            var image = (function() {
                var tempCanvas = document.createElement('canvas'),
                    tempContext = tempCanvas.getContext('2d');
                tempCanvas.width = settings.particles.size;
                tempCanvas.height = settings.particles.size;
                
                function to(t) {
                    var point = basePointOnHeart(t);
                    point.x = settings.particles.size / 2 + point.x * settings.particles.size / 350;
                    point.y = settings.particles.size / 2 - point.y * settings.particles.size / 350;
                    return point;
                }

                tempContext.beginPath();
                var t = -Math.PI;
                var point = to(t);
                tempContext.moveTo(point.x, point.y);
                while (t < Math.PI) {
                    t += 0.01; 
                    point = to(t);
                    tempContext.lineTo(point.x, point.y);
                }
                tempContext.closePath();
                
                var gradient = tempContext.createLinearGradient(0, 0, settings.particles.size, settings.particles.size);
                gradient.addColorStop(0, '#ff0055'); 
                gradient.addColorStop(1, '#ff758c'); 
                tempContext.fillStyle = gradient;
                
                tempContext.fill();
                var img = new Image();
                img.src = tempCanvas.toDataURL();
                return img;
            })();

            function render() {
                requestAnimationFrame(render);
                var newTime = new Date().getTime() / 1000,
                    deltaTime = newTime - (time || newTime);
                time = newTime;
                
                context.clearRect(0, 0, canvas.width, canvas.height);
                var amount = particleRate * deltaTime;

                // TÍNH TOÁN TỶ LỆ DỰA TRÊN KÍCH THƯỚC TRÌNH DUYỆT (UI LOCK)
                var scale = 1; // Máy tính giữ nguyên tỷ lệ 1
                if (window.innerWidth <= 400) scale = 0.5;      // Mobile nhỏ
                else if (window.innerWidth <= 768) scale = 0.6; // Mobile/Tablet
                
                for (var i = 0; i < amount; i++) {
    var t = Math.PI - 2 * Math.PI * Math.random();
    var pos = basePointOnHeart(t);
    
    // Tính hướng văng gốc
    var dir = pos.clone().length(settings.particles.velocity * scale);

    // BÍ QUYẾT: Giữ lại 25% hạt làm "lớp vỏ ngoài", 75% còn lại lấp đầy bên trong
    var isShell = Math.random() < 0.25; 

    if (!isShell) {
        // Rải đều 75% hạt vào diện tích bên trong lõi
        var fillRatio = Math.sqrt(Math.random());
        pos.x *= fillRatio;
        pos.y *= fillRatio;

        // Thêm nhiễu ngẫu nhiên vào hướng bay
        // Điều này khiến hạt không bay đâm thẳng vào tâm (gây ra đường kẻ) mà sẽ tụ lại tự nhiên
        dir.x += (Math.random() - 0.5) * 80 * scale;
        dir.y += (Math.random() - 0.5) * 80 * scale;
    } else {
        // Hạt ở lớp vỏ cũng thêm tí xíu nhiễu để viền trông "tơi" và bồng bềnh hơn
        dir.x += (Math.random() - 0.5) * 15 * scale;
        dir.y += (Math.random() - 0.5) * 15 * scale;
    }

    // Áp dụng tỷ lệ scale cho các màn hình (điện thoại/máy tính)
    pos.x *= scale;
    pos.y *= scale;

    // Đưa hạt vào canvas
    particles.add(
        canvas.width / 2 + pos.x, 
        canvas.height / 2 - pos.y, 
        dir.x, 
        -dir.y
    );
}
                particles.update(deltaTime);
                particles.draw(context, image);
            }

            function onResize() {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }
            window.addEventListener('resize', onResize);

            setTimeout(function() {
                onResize();
                render();
            }, 10);
        })(pinkboardCanvas);
    }

    /* ==========================================
       3. HIỆU ỨNG SAO RƠI PHÔNG NỀN
    ========================================== */
    const starCanvas = document.getElementById("stars");
    if (starCanvas) {
        const ctxStar = starCanvas.getContext("2d");
        starCanvas.width = window.innerWidth;
        starCanvas.height = window.innerHeight;

        const stars = [];
        for(let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * starCanvas.width,
                y: Math.random() * starCanvas.height,
                radius: Math.random() * 1.5,
                speed: Math.random() * 0.5 + 0.1,
                color: Math.random() > 0.8 ? "#ffb3c6" : "white" 
            });
        }

        function drawStars() {
            ctxStar.clearRect(0, 0, starCanvas.width, starCanvas.height);
            for(let star of stars) {
                ctxStar.fillStyle = star.color;
                ctxStar.beginPath();
                ctxStar.moveTo(star.x, star.y);
                ctxStar.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctxStar.fill();
                star.y += star.speed;
                if(star.y > starCanvas.height) {
                    star.y = 0;
                    star.x = Math.random() * starCanvas.width;
                }
            }
            requestAnimationFrame(drawStars);
        }
        drawStars();

        window.addEventListener('resize', () => {
            starCanvas.width = window.innerWidth;
            starCanvas.height = window.innerHeight;
        });
    }
});
