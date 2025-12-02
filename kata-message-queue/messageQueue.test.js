const { createMessageQueue } = require('./messageQueue.js');

describe('MessageQueue - Kata TDD', () => {
    
    test('TEST 1: debe crear una cola vacía por defecto', () => {
        const queue = createMessageQueue();
        expect(queue.getAll()).toEqual([]);
        expect(queue.getAll().length).toBe(0);
    });
    
    test('TEST 2: debe agregar un mensaje a la cola', () => {
        const queue = createMessageQueue();
        const mensaje = { id: 1, text: 'Hola', type: 'info' };
        
        queue.push(mensaje);
        
        expect(queue.getAll().length).toBe(1);
        expect(queue.getAll()[0]).toEqual(mensaje);
    });
    
    test('TEST 3: debe respetar el tamaño máximo (FIFO)', () => {
        const queue = createMessageQueue(3);
        
        queue.push({ id: 1, text: 'Msg 1', type: 'info' });
        queue.push({ id: 2, text: 'Msg 2', type: 'info' });
        queue.push({ id: 3, text: 'Msg 3', type: 'info' });
        queue.push({ id: 4, text: 'Msg 4', type: 'info' });
        
        const resultado = queue.getAll();
        expect(resultado.length).toBe(3);
        expect(resultado[0].id).toBe(2);
        expect(resultado[2].id).toBe(4);
    });
     test('TEST 4: debe retornar y eliminar el primer mensaje', () => {
        const queue = createMessageQueue();
        queue.push({ id: 1, text: 'Primero', type: 'info' });
        queue.push({ id: 2, text: 'Segundo', type: 'info' });
        
        const primero = queue.next();
        
        expect(primero.id).toBe(1);
        expect(queue.getAll().length).toBe(1);
        expect(queue.getAll()[0].id).toBe(2);
    });
    
    test('TEST 5: debe limpiar todos los mensajes', () => {
        const queue = createMessageQueue();
        queue.push({ id: 1, text: 'Test', type: 'info' });
        queue.push({ id: 2, text: 'Test2', type: 'info' });
        
        queue.clear();
        
        expect(queue.getAll().length).toBe(0);
        expect(queue.getAll()).toEqual([]);
    });
    
    test('TEST 6: debe eliminar un mensaje específico por id', () => {
        const queue = createMessageQueue();
        queue.push({ id: 1, text: 'Msg 1', type: 'info' });
        queue.push({ id: 2, text: 'Msg 2', type: 'info' });
        queue.push({ id: 3, text: 'Msg 3', type: 'info' });
        
        queue.remove(2);
        
        const resultado = queue.getAll();
        expect(resultado.length).toBe(2);
        expect(resultado.find(m => m.id === 2)).toBeUndefined();
        expect(resultado[0].id).toBe(1);
        expect(resultado[1].id).toBe(3);
    });
    
});