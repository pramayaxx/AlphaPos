const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "    } catch(err) {\n      console.error(err);\n      alert('Failed to add customer');",
  "    } catch(err: any) {\n      console.error(err);\n      alert(err.message || 'Failed to add customer');"
);

code = code.replace(
  "    } catch(err) {\n      console.error(err);\n      alert('Failed to add customer');",
  "    } catch(err: any) {\n      console.error(err);\n      alert(err.message || 'Failed to add customer');"
);

fs.writeFileSync('src/App.tsx', code);
