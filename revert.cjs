const fs = require('fs');
const path = require('path');

function rw(d) {
    fs.readdirSync(d).forEach(f => {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) rw(p);
        else if (p.endsWith('.tsx')) {
            let c = fs.readFileSync(p, 'utf8');
            if (c.includes('bg-stone-100')) {
                let newC = c.replace(/\bbg-stone-100\b/g, 'bg-white');
                if (c !== newC) {
                    fs.writeFileSync(p, newC);
                    console.log('Reverted', p);
                }
            }
        }
    });
}
rw('./views');
rw('./components');
