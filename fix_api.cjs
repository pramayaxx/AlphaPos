const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

code = code.replace(/if \(!res\.ok\) throw new Error\(await res\.text\(\)\);/g, `if (!res.ok) {
      let errText = await res.text();
      try {
        const json = JSON.parse(errText);
        if (json.message) errText = json.message;
        else if (json.error) errText = json.error;
      } catch (e) {}
      throw new Error(errText);
    }`);

fs.writeFileSync('src/api.ts', code);
