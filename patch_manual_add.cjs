const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "    } catch (err) {\n      console.error('Manual product add error:', err);\n    }",
  "    } catch (err: any) {\n      console.error('Manual product add error:', err);\n      alert(`Error: ${err.message || 'Unknown error'}`);\n    }"
);

fs.writeFileSync('src/App.tsx', code);
