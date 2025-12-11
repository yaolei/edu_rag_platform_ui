import {useEffect, useRef} from 'react'

const Snow = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        const snowflakes = [];
        const maxSnowFlakes = 200;

        for (let i = 0; i < maxSnowFlakes; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 0.5,
                speed: Math.random() * 1.5 + 0.5,
                wind: Math.random() * 1 - 0.5,
                opacity: Math.random()* 0.7 + 0.3,
                swing: Math.random() * 3,
                swingSpeed: Math.random() * 0.02 + 0.01
            });
        }

        const drawSnowflakes = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.beginPath();
            snowflakes.forEach(snowflake => {
                ctx.globalAlpha = snowflake.opacity;
                ctx.moveTo(snowflake.x, snowflake.y);
                ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2, true);

                snowflake.x += snowflake.speed;
                snowflake.y += snowflake.wind;

                if (snowflake.y > canvas.height) {
                    snowflake.y = -5
                    snowflake.x = Math.random() * canvas.width
                }

                if (snowflake.x > canvas.width) {
                    snowflake.x = 0 
                } else if (snowflake.x < 0) {
                    snowflake.x = canvas.width
                }
            })
            ctx.fill();
            requestAnimationFrame(drawSnowflakes);
        }
        const animationId = requestAnimationFrame(drawSnowflakes);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        }
    },[])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
            }}
        />
    )
}

export default Snow;