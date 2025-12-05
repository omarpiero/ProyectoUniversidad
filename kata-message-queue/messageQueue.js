function createMessageQueue(maxSize = 50) {
    const queue = [];
    
    return {
        push(msg) {
            queue.push(msg);
            if (queue.length > maxSize) {
                queue.shift();
            }
        },
        
        next() {
            return queue.shift();
        },
        
        clear() {
            queue.length = 0;
        },
        
        getAll() {
            return [...queue];
        },
        
        remove(id) {
            const index = queue.findIndex(m => m.id === id);
            if (index > -1) {
                queue.splice(index, 1);
            }
        }
    };
}

module.exports = { createMessageQueue };