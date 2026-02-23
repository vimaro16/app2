# 🔧 Guía de Solución de Problemas - SuerteApp

## ⚠️ Errores Comunes y Soluciones

### Error: "Failed to connect to MetaMask"

**Síntoma:**
Al entrar a la aplicación, aparece un error en la consola:
```
Failed to connect to MetaMask
at Object.connect (chrome-extension://...)
```

**Causa:**
- La extensión de MetaMask (wallet de criptomonedas) en tu navegador está intentando inyectarse automáticamente en todas las páginas web.
- Esto NO afecta la funcionalidad de SuerteApp.
- Es un comportamiento normal de las extensiones de wallets.

**Soluciones:**

#### Opción 1: Ignorar el error (Recomendado) ✅
- El error es inofensivo y no afecta la aplicación
- Ya está manejado en el código para que no bloquee la app
- Puedes usar la aplicación normalmente

#### Opción 2: Deshabilitar MetaMask temporalmente
1. Click derecho en el icono de MetaMask en tu navegador
2. Selecciona "Administrar extensión"
3. Desactiva "Puede leer y cambiar datos del sitio"
4. O deshabilita temporalmente la extensión

#### Opción 3: Usar modo incógnito
- Abre una ventana de incógnito en tu navegador
- Las extensiones no se cargan por defecto
- Accede a la app sin conflictos

#### Opción 4: Usar otro navegador
- Usa un navegador sin extensiones de wallets instaladas
- Chrome, Firefox, Safari, Edge, etc.

---

## 🌐 Problemas de Conexión

### "Cannot connect to backend"

**Solución:**
1. Verifica que el backend esté corriendo:
   ```bash
   sudo supervisorctl status backend
   ```
2. Si no está corriendo:
   ```bash
   sudo supervisorctl restart backend
   ```
3. Verifica que la URL en `.env` sea correcta

### "Network Error" al hacer login

**Solución:**
1. Verifica que CORS esté configurado correctamente en backend
2. Verifica que la URL del backend en frontend/.env sea correcta
3. Reinicia ambos servicios:
   ```bash
   sudo supervisorctl restart all
   ```

---

## 🔐 Problemas de Autenticación

### "Not authenticated" o Token expirado

**Solución:**
1. Cierra sesión y vuelve a iniciar
2. Borra el localStorage del navegador:
   - F12 → Application → Local Storage → Clear
3. Vuelve a hacer login

### No puedo recuperar mi contraseña

**Solución:**
1. Verifica que RESEND_API_KEY esté configurada en backend/.env
2. Revisa los logs del backend:
   ```bash
   tail -f /var/log/supervisor/backend.err.log
   ```
3. Verifica que el email existe en la base de datos:
   ```bash
   mongosh test_database --eval "db.users.find({email: 'tu@email.com'})"
   ```

---

## 📊 Problemas con Reportes

### Los reportes no se descargan

**Solución:**
1. Verifica que tengas rol de admin
2. Verifica que las librerías estén instaladas:
   ```bash
   cd /app/backend
   pip install openpyxl reportlab
   ```
3. Reinicia el backend

### "No data" en los reportes

**Solución:**
- Esto es normal si no hay transacciones aún
- Crea algunas rifas y transacciones de prueba
- Los reportes mostrarán datos reales

---

## 🎨 Problemas con el CMS

### Los cambios no se reflejan en la página

**Solución:**
1. Haz "hard refresh" en el navegador:
   - Windows/Linux: Ctrl + Shift + R
   - Mac: Cmd + Shift + R
2. Verifica que guardaste los cambios en el CMS
3. Revisa la consola del navegador para errores

### El preview no muestra los cambios

**Solución:**
1. El preview es en tiempo real, no necesitas guardar
2. Asegúrate de estar en el tab "Vista Previa"
3. Refresca la página si es necesario

---

## 🔄 Comandos Útiles

### Reiniciar servicios
```bash
# Reiniciar todo
sudo supervisorctl restart all

# Reiniciar solo backend
sudo supervisorctl restart backend

# Reiniciar solo frontend
sudo supervisorctl restart frontend

# Ver estado
sudo supervisorctl status
```

### Ver logs
```bash
# Backend errors
tail -f /var/log/supervisor/backend.err.log

# Backend output
tail -f /var/log/supervisor/backend.out.log

# Frontend errors
tail -f /var/log/supervisor/frontend.err.log
```

### Base de datos
```bash
# Conectar a MongoDB
mongosh test_database

# Ver usuarios
db.users.find().pretty()

# Ver rifas
db.raffles.find().pretty()

# Ver transacciones
db.payment_transactions.find().pretty()
```

---

## 🆘 Soporte

Si ninguna de estas soluciones funciona:

1. **Copia el error completo** de la consola del navegador (F12)
2. **Toma un screenshot** si es posible
3. **Describe qué estabas haciendo** cuando ocurrió el error
4. **Incluye:**
   - Navegador y versión
   - Sistema operativo
   - Pasos para reproducir el error

---

## ✅ Verificación de Salud del Sistema

Para verificar que todo está funcionando correctamente:

```bash
# 1. Verificar servicios
sudo supervisorctl status

# 2. Verificar backend
curl https://ventana-proyecto.preview.emergentagent.com/api/

# 3. Verificar base de datos
mongosh test_database --eval "db.stats()"

# 4. Verificar logs recientes
tail -n 20 /var/log/supervisor/backend.err.log
tail -n 20 /var/log/supervisor/frontend.err.log
```

Todos los servicios deberían mostrar "RUNNING" ✅

---

## 📚 Recursos Adicionales

- **Documentación API:** https://ventana-proyecto.preview.emergentagent.com/docs
- **Panel Admin:** https://ventana-proyecto.preview.emergentagent.com/admin
- **Logs del sistema:** `/var/log/supervisor/`

---

**Última actualización:** Febrero 2026
