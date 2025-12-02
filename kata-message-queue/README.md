Kata TDD: Cola de Mensajes

Implementación de una cola de mensajes con tamaño máximo usando Test-Driven Development (TDD).

## 📖 Descripción

Cola FIFO (First In, First Out) con operaciones:
- `push(msg)` - Agregar mensaje
- `next()` - Obtener y eliminar el primero
- `clear()` - Limpiar cola
- `getAll()` - Obtener todos los mensajes
- `remove(id)` - Eliminar mensaje por ID

## 🧪 Tests Implementados

- ✅ TEST 1: Crear cola vacía por defecto
- ✅ TEST 2: Agregar mensaje a la cola
- ✅ TEST 3: Respetar tamaño máximo (FIFO)
- ✅ TEST 4: Obtener y eliminar primer mensaje
- ✅ TEST 5: Limpiar todos los mensajes
- ✅ TEST 6: Eliminar mensaje específico por ID
## 🔧 Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: v14.0.0 o superior
- **npm**: v6.0.0 o superior

### Verificar instalación:
```bash
node --version
npm --version
**Si no tienes Node.js instalado:**  
Descárgalo desde: [https://nodejs.org/](https://nodejs.org/)
# Opción 2: Si ya tienes la carpeta
cd ruta/a/kata-message-queue
```

### 2. Instalar dependencias
```bash
npm install
```

**Esto instalará:**
- ✅ Jest (framework de testing)
- ✅ Todas las dependencias necesarias

**Resultado esperado:**
```
added 300 packages in 15s
```

### 3. Verificar instalación
```bash
npx jest --version
```

Debería mostrar: `29.7.0` (o versión similar)

---

## 🧪 Ejecutar Tests

### ▶️ Opción 1: Ejecutar todos los tests (una vez)
```bash
npm test
```
**Salida esperada:**
```
PASS  ./messageQueue.test.js
  MessageQueue - Kata TDD
    ✓ TEST 1: debe crear una cola vacía por defecto (3 ms)
    ✓ TEST 2: debe agregar un mensaje a la cola (1 ms)
    ✓ TEST 3: debe respetar el tamaño máximo (FIFO) (2 ms)
    ✓ TEST 4: debe retornar y eliminar el primer mensaje (1 ms)
    ✓ TEST 5: debe limpiar todos los mensajes (1 ms)
    ✓ TEST 6: debe eliminar un mensaje específico por id (2 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.5 s
```