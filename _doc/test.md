Excelente ejercicio 💡
Eso que planteas es **exactamente cómo se aprende cloud en serio**.

Vamos paso a paso y **100% práctico**.

---

# 🎯 Objetivo del ejercicio

1. Empezar con `t2.micro`
2. Simular **carga real**
3. Ver **cuándo se rompe**
4. Probar **2 formas de escalar**

   - Vertical (más recursos)
   - Horizontal (más instancias)

---

# 1️⃣ Punto de partida – t2.micro

### Terraform (base)

```hcl
resource "aws_instance" "api" {
  ami           = "ami-0f5fcdfbd140e4ab7"
  instance_type = "t2.micro"
  key_name      = "ec2_my_key_pair"

  tags = {
    Name = "rembg-api"
  }
}
```

Instala stack:

```bash
sudo apt update
sudo apt install -y python3-pip
pip install flask gunicorn rembg pillow
```

Run:

```bash
gunicorn main:app -w 1 -b 0.0.0.0:8000
```

---

# 2️⃣ Simular consumo (CARGA REAL)

## 💥 CPU Stress

```bash
sudo apt install -y stress
stress --cpu 2 --timeout 60
```

Resultado:

- CPU al 100%
- Créditos se gastan

---

## 💥 RAM Stress

```bash
sudo apt install -y stress-ng
stress-ng --vm 1 --vm-bytes 800M --timeout 60s
```

👉 t2.micro se empieza a morir 💀

---

## 🔥 Carga REAL con imágenes

Desde tu laptop:

```bash
ab -n 20 -c 2 \
-H "X-Api-Key: MY_API_KEY" \
-F "image_file=@test.jpg" \
http://18.222.21.11:8000/v2.0/removebg
```

Mira:

```bash
htop
free -h
```

---

# 3️⃣ Identificar el BREAKING POINT

Observa:

- RAM > 90%
- swap empezar (muy lento)
- OOM killer
- requests tardan >10s

✅ **Anótalo** → parte del ejercicio.

---

# 4️⃣ Escalado VERTICAL (lo más simple)

### Qué es

Cambiar:

```hcl
t2.micro → t3.small → t3.medium
```

### Cómo

1. Stop EC2
2. Change Instance Type
3. Start

✅ mismo IP (si es Elastic IP)
✅ simple
❌ límite físico

---

# 5️⃣ Escalado HORIZONTAL (modo PRO)

### Qué es

2–N instancias + load balancer

### Paso 1: convertir EC2 en "template"

Usa `user_data` para auto-instalar:

```hcl
user_data = file("startup.sh")
```

---

### Paso 2: Launch Template

```hcl
resource "aws_launch_template" "api" {
  image_id      = "ami-0f5fcdfbd140e4ab7"
  instance_type = "t3.small"
}
```

---

### Paso 3: Auto Scaling Group

```hcl
resource "aws_autoscaling_group" "api" {
  desired_capacity = 1
  max_size         = 4
  min_size         = 1
}
```

---

### Paso 4: Application Load Balancer

- Distribuye tráfico
- Health checks

---

# 6️⃣ Comparación REAL (lo que debes aprender)

| Método         | Pros            | Contras      |
| -------------- | --------------- | ------------ |
| Vertical       | Fácil           | Límite       |
| Horizontal     | Escala infinito | Más complejo |
| CPU burstable  | Barato          | Inestable    |
| Instancia fija | Predictible     | Paga 24/7    |

---

# 7️⃣ Métricas que DEBES mirar

CloudWatch:

- CPUUtilization
- NetworkIn
- Memory (con agent)
- StatusCheckFailed

---

# 8️⃣ Resultado esperado del ejercicio

Tú deberías poder responder:
✅ ¿Cuántas imágenes aguanta t2.micro?
✅ ¿En qué segundo muere?
✅ ¿Qué mejora más: RAM o CPU?
✅ ¿Escalar vertical u horizontal?

---

# 9️⃣ BONUS (nivel DevOps real)

👉 test de cola

```bash
sudo apt install redis
```

Simula:

- 10 requests llegan
- solo 2 se procesan
- resto espera

---

# ✅ Conclusión clara

🎓 ESTE ejercicio es excelente
🚨 t2.micro sirve SOLO para aprender
🚀 Producción = escalar
🧠 Aprenderás más aquí que en 10 cursos

---

Si quieres:
✅ te doy **scripts exactos**
✅ Terraform completo del ejercicio
✅ guía paso a paso con checkpoints
✅ métricas esperadas

Dime cómo lo quieres continuar 👇
