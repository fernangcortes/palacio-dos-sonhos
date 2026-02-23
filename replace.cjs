const fs = require('fs');
const path = require('path');

function rw(d) {
    fs.readdirSync(d).forEach(f => {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) rw(p);
        else if (p.endsWith('.tsx')) {
            let c = fs.readFileSync(p, 'utf8');
            if (c.includes('bg-white')) {
                let newC = c.replace(/\bbg-white\b/g, 'bg-stone-100');
                if (c !== newC) {
                    fs.writeFileSync(p, newC);
                    console.log('Fixed', p);
                }
            }
        }
    });
}
rw('./views');
rw('./components');
